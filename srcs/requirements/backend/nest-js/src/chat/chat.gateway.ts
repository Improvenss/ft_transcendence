/**
 * LINK: https://dzone.com/articles/build-a-real-time-chat-application-with-nestjs-and-postgresql
 */
import { ConnectedSocket, MessageBody,
	OnGatewayConnection,
	OnGatewayDisconnect,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { Body, NotFoundException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { CreateMessageDto } from './dto/chat-message.dto';
import { CreateDmMessageDto } from './dto/chat-dmMessage.dto';
import { GameService } from 'src/game/game.service';

var count: number = 0;

@WebSocketGateway({ 
	cors: {
		origin: "*",
	},
	namespace: "/chat" // Buradaki namespace backend'in https://localhost:3000/chat sayfasina geldiginde baglanti kurmus oluyor.
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
	constructor(
		protected readonly usersService: UsersService,
		protected readonly chatService: ChatService,
		protected readonly gameService: GameService,
	) {}

	public connectedIds: Map<number, Socket> = new Map();
	public connectedSockets: Map<string, number> = new Map(); //returned user id
	private gameRooms: Map<string, number> = new Map();

	@WebSocketServer()
	server: Server;

	async handleConnection(client: Socket){
		const clientId = client.id;
		console.log(`Client connected ✅: socket.id[${clientId}]`);
		const clientQuery = client.handshake.query;
		const userId = parseInt(clientQuery.id as string);
		const duplicateSocket = this.connectedIds.get(userId);
		if (duplicateSocket) {
			await this.handleDisconnect(duplicateSocket);
		}
		this.connectedIds.set(userId, client);
		this.connectedSockets.set(clientId, userId);
		await this.usersService.updateUser({id: userId, socketId: clientId});
	}

	async handleDisconnect(client: Socket) {
		const clientId = client.id;
		await this.handleUserStatus({status: 'offline'}, client);
		console.log(`Client disconnected 💔: socket.id[${clientId}]`);
		const userId = this.connectedSockets.get(clientId);
		this.connectedIds.delete(userId); // Bağlantı kesildiğinde soketi listeden kaldır
		this.connectedSockets.delete(clientId);
		client.disconnect(true);
	}

	getUserSocket(userId: number){
		const userSocket = this.connectedIds.get(userId);
		if (!userSocket){	
			throw new NotFoundException('User socket not found!');
		}
		return (userSocket);
	}

	@SubscribeMessage('userStatus')
	async handleUserStatus(
		@Body() body: {
			status: 'online' | 'offline' | 'in-chat' | 'in-game' | 'afk'
		},
		@ConnectedSocket() socket: Socket
	){
		try {
			const userId = this.connectedSockets.get(socket.id);
			if (!userId)
				throw new NotFoundException('User socket not found!');
			console.log('Received userStatus:', `user[${userId}]`, `status[${body.status}]`);
			await this.usersService.updateUser({
				id: userId,
				status: body.status,
			})
		} catch (err) {
			console.error("@SubscribMessage(userStatus):", err.message);
		}
	}

	@SubscribeMessage('createDm')
	async handleDm(
		@MessageBody() 
		{ dm, author, content }:
			{ dm: number, author: number, content: string },
		@ConnectedSocket() socket: Socket, //Eğer burada yine mesaj yazarı null olursa socket var mı yok mu kontrol ettir.
	){
		try {
			const messageUser = await this.usersService.getUserPrimary({id: author});
			if (!messageUser)
				throw new NotFoundException('User not found!');
			//const messageDm = await this.chatService.getDmPrimary(dm);
			const messageDm = await this.chatService.getDmRelation(dm, {members: true, messages: true});
			if (!messageDm)
				throw new NotFoundException('Dm not found!');

			if (!socket.rooms.has(`dm-${dm}`)) {
				console.log(`Socket[${socket.id}] - user[${messageUser.login}] not in this dm(${dm})!`);
				throw new Error(`user[${messageUser.login}] not in this dm(${dm})!`);
			}

			const createDmMessageDto: CreateDmMessageDto = {
				author: messageUser,
				dm: messageDm,
				content: content,
				sentAt: new Date()
			};

			const returnMessage = await this.chatService.createDmMessage(createDmMessageDto);
			delete returnMessage.dm;
			console.log(`Message recived: dm[${dm}] user[${messageUser.login}] content[${content}]`);

			const {id} = messageDm.usersData.find((member) => member.id !== author);
			if (!messageDm.members.find((member) => member.id === id)){
				await this.chatService.addUserDm(messageDm.id, await this.usersService.getUserPrimary({id: id}));
				const userSocket = this.getUserSocket(id);
				userSocket.join(`dm-${messageDm.id}`);
				userSocket.emit('dmListener', {
					action: 'join',
					dmId: messageDm.id,
					data: messageDm
				})
			}

			this.server.to(`dm-${messageDm.id}`).emit(`dmListener`, {
				action: 'newMessage',
				dmId: dm,
				data: returnMessage,
			});
		} catch(err) {
			console.log("CreateDmMessage Err: ", err.message);
			const notif = await this.usersService.createNotif(author, author, 'text', err.message);
			this.server.emit(`user-notif:${author}`, notif);
		}
	}

	/**
	 * https://<project_ip>:3000/chat'e baglanan socket'in;
	 *  .emit() fonksiyonu ile 'createMessage' istegi attiginda calistigi yer.
	 * 
	 * Postman'dan mesaj gondermek istediginde;
	 *  Socket.IO ile url kismina 'https://10.12.14.8:3000/chat' yazarak,
	 *  baglandiktan sonra, 'event name' kismina da 'createMessage' yazarak
	 *  mesaji gonderdigimizde burasi calisir ama burada ekstradan
	 *  channel de var.
	 * ornek;
	 *  https://10.12.14.8:3000/chat -> createMessage -> compose message: Postman:
	 *  Change type 'Text' to 'JSON'.
	 *  {
	 * 		"channel": "global",
	 * 		"message": "Message from Postman! :)"
	 *  }
	 * @param param0 
	 */
	@SubscribeMessage('createMessage')
	async handleMessage(
		@MessageBody() 
		{ channel, author, content }:
			{ channel: number, author: number, content: string },
		@ConnectedSocket() socket: Socket, //Eğer burada yine mesaj yazarı null olursa socket var mı yok mu kontrol ettir.
	){
		try {
			const messageUser = await this.usersService.getUserPrimary({id: author});
			if (!messageUser)
				throw new NotFoundException('User not found!');
			const messageChannel = await this.chatService.getChannelPrimary({id: channel});
			if (!messageChannel)
				throw new NotFoundException('Channel not found!');

			if (!socket.rooms.has(`${messageChannel.id}`)) {
				console.log(`Socket[${socket.id}] - user[${messageUser.login}] not in this channel(${messageChannel.name})!`);
				throw new Error(`user[${messageUser.login}] not in this channel(${messageChannel.name})!`);
			}
		
			const createMessageDto: CreateMessageDto = {
				author: messageUser,
				channel: messageChannel,
				content: content,
				sentAt: new Date(),
			};

			const returnMessage = await this.chatService.createMessage(createMessageDto);
			delete returnMessage.channel;
			console.log(`Message recived: channel[${messageChannel.name}] user[${messageUser.login}] id[${returnMessage.id}]: content[${returnMessage.content}]`);
			this.server.to(`${messageChannel.id}`).emit(`channelListener`,{
				action: 'newMessage',
				channelId: channel,
				data: returnMessage,
			});
			//this.server.to(`${messageChannel.id}`).emit(`listenChannelMessage:${messageChannel.id}`, returnMessage);
		} catch (err){
			console.log("CreateMessage Err: ", err.message);
			const notif = await this.usersService.createNotif(author, author, 'text', err.message);
			this.server.emit(`user-notif:${author}`, notif);
		}
	}

	/* Belirtilen kanaldaki tüm socket bağlantılarını koparıyor */
	forceLeaveChannel(channelName: string) {
		this.server.in(channelName).socketsLeave(channelName);
		console.log(`Channel: [${channelName}] users leaved`);
	}

	/* Oda'ya kayıtlı kullanıcıların socketlerini döndürüyor. */
	getRoomConnections(channelName: string){
		const channelSockets = this.server.in(channelName).fetchSockets();
		if (!channelSockets)
			throw new NotFoundException('Channel socket not found.');
		return (channelSockets);
	}

	/*
		Oda socketinden dönen arrayden kullanıcının soketini buluyor.
		Tüm serverdan aramak yerine böylesi daha efektif.
	*/
	async getRoomUserConnection(channelName: string, userSocketId: string) {
		const channelSockets = await this.getRoomConnections(channelName);
		const userSocket = channelSockets.find(socket => socket.id === userSocketId);
		if (!userSocket)
			throw new NotFoundException('User socket not found');
		return (userSocket);
	}

	async userLeaveChannel(channelName: string, userSocketId: string){
		const userSocket = await this.getRoomUserConnection(channelName, userSocketId);
		userSocket.leave(channelName);
		console.log(`Channel: [${channelName}] Leaved: [${userSocketId}]`);
	}

//------------------------------------------------------------------------

	@SubscribeMessage(`joinGameRoom`)
	async handleJoinGameRoom(
		@ConnectedSocket() socket: Socket,
		data: { gameRoom: string }
	){
		const intervalID = setInterval(() => {
		}, 16);
	}

	// @SubscribeMessage(`startGameRoom:${}`)


	/**
	 * Oyun odasina baglandiktan sonra gelen komutlari burada
	 *  ele aliyouz.
	 * @param param0 
	 */
	@SubscribeMessage('commandGameRoom')
	async handleCommandGameRoom(
		@MessageBody() 
		{ gameRoom, command }:
			{ gameRoom: string, command: string })
	{
		console.log(`GAME ROOM: gelen command[${count++}]:`, command);
		console.log('GAME ROOM: MessageBody():', {gameRoom, command});
		this.server.to(gameRoom).emit("gameRoomCommandListener", command);
	}

	/**
	 * Oyun odasindan cikis yaparken socket baglantisini kesmek icin.
	 * @param roomData 
	 * @param socket 
	 */
	@SubscribeMessage('leaveGameRoom')
	async handleLeaveGameRoom(@Body() roomData: any,
		@ConnectedSocket() socket: Socket)
	{
		if (socket.rooms.has(roomData.name))
		{
			// this.server.to(roomData.name).emit('messageToClient', `Channel(${roomData.name}): ${socket.id} left the channel!`);
			socket.leave(roomData.name)
			console.log(`${roomData.name} odasindan cikti: ${socket.id}`);
		}
		else {

			console.log(`${socket.id} zaten ${roomData.name} oyun odasinda degil! :D?`);
		}
	}


// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}