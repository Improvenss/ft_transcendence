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
import { User } from 'src/users/entities/user.entity';
import { Channel } from './entities/chat.entity';
import { CreateMessageDto } from './dto/chat-message.dto';

var count: number = 0;

/**
 * NOTES: Sol taraftaki channel'lere tikladigimizda;
 *  https://localhost:3000/chat/#channel1 urlsine gidecek ve soket bagli degilse baglantisi yapilacak
 *  yani; joinChannel istegi.
 */

@WebSocketGateway({ 
	cors: {
		origin: "*",
	},
	namespace: "/chat" // Buradaki namespace backend'in https://localhost:3000/chat sayfasina geldiginde baglanti kurmus oluyor.
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
	constructor(
		private readonly usersService: UsersService,
		private readonly chatService: ChatService,
	) {}

	public connectedUsers: Map<string, Socket> = new Map();

	@WebSocketServer()
	server: Server;

	// @SubscribeMessage('createMessage')
	// async handleMessage(@MessageBody() message: string) {
	// 	console.log(`BACKEND: gelen msg[${count++}]:`, message);
	// 	this.server.emit("messageToClient", message);
	// }
	
	/**
	 * Buradaki handleConnection function isimleri ozel isimlerdir.
	 *  Bu soket basarili bir sekilde baglandiginda calisir.
	 * @param client 
	 * @param args 
	 */
	handleConnection(client: Socket, ...args: any[])
	{
		if (this.connectedUsers.has(client.id)) {
			console.log(`Client already connected 🟡: socket.id[${client.id}]`);
			client.disconnect(true); // Bağlantıyı kapat
			return;
		}
		this.connectedUsers.set(client.id, client);
		console.log(`Client connected ✅: socket.id[${client.id}]`);
			//Do stuffs
	}
	/**
	 * Buradaki handleDisconnect function isimleri ozel isimlerdir.
	 *  Backend'e baglanan socket'in baglantisi kesildiginde calisir.
	 * @param client Client socket.
	 */
	handleDisconnect(client: Socket) {
		console.log(`Client disconnected 💔: socket.id[${client.id}]`);
		this.connectedUsers.delete(client.id); // Bağlantı kesildiğinde soketi listeden kaldır
		//Do stuffs
		this.handleUserStatus({status: 'offline'}, client);
	}

	/* Tüm serverdan kullanıcıyı buluyor. */
	getUserSocketConnection(userId: string): Socket | undefined {
		return this.connectedUsers.get(userId);
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

	/* Belirtilen kanaldaki tüm socket bağlantılarını koparıyor */
	forceLeaveChannel(channelName: string) {
		// const namespace = this.server.of('/chat');
		// namespace.in(channelName).socketsLeave(channelName);
		this.server.in(channelName).socketsLeave(channelName);
		console.log(`Channel: [${channelName}] users leaved`);
	}

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
	 * Oyun odasini burada olusturuyoruz.
	 * @param roomData 
	 * @param socket 
	 * @returns 
	 */
	//@SubscribeMessage('joinGameRoom')
	//async handleJoinGameRoom(
	//	@Body() roomData: {
	//		name: string,
	//	},
	//	@ConnectedSocket() socket: Socket)
	//{
	//	try
	//	{
	//		console.log("Socket'in Game Room'a joinlenme kismi - joinRoom -");
	//		const responseUser = await this.usersService.findUser(null, socket);
	//		if (responseUser === null)
	//			throw (new NotFoundException("User not found for join Game Room!"));
	//		const singleUser = Array.isArray(responseUser) ? responseUser[0] : responseUser;
	//		const responseRoom = await this.gameService.findGameRoom(roomData.name, ['members']);
	//		const singleRoom = Array.isArray(responseRoom) ? responseRoom[0] : responseRoom;
	//		if (Array.isArray(responseRoom) ? responseRoom.length === 0 : responseRoom === null)
	//			throw (new NotFoundException("Game Room not found!"));
	//		const	ifUserInRoom = await this.gameService.findRoomUser(singleRoom, singleUser);
	//		if (!ifUserInRoom)
	//			throw (new NotFoundException("User is not in Game Room!"));
	//		else if (singleRoom !== null
	//			&& singleRoom.name === roomData.name)
	//		{
	//			if (socket.rooms.has(roomData.name))
	//				return (console.log(`[${socket.id}] alredy '${roomData.name}' room.! :)`));
	//			socket.join(roomData.name);
	//			if (singleUser.socketId === socket.id) {
	//				console.log(`Room: '${roomData.name}' Joined: [${socket.id}]`);
	//				this.server.to(roomData.name).emit('BURAYA ROOMUN MESAJ KISMINA BASTIRACAGIZ', `Room(${roomData.name}): ${socket.id} joined!`);
	//			}
	//		}
	//		else
	//			throw (new Error("Socket: 'joinGameRoom': Unexpected error!"));
	//	}
	//	catch (err)
	//	{
	//		console.error("@SubscribMessage('joinGameRoom'):", err);
	//	}
	//}

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
		else
			console.log(`${socket.id} zaten ${roomData.name} oyun odasinda degil! :D?`);
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
			{ channel: string, author: string, content: string },
		@ConnectedSocket() socket: Socket,
	){
		try {
			if (!socket.rooms.has(channel))
			{
				console.log(`Socket[${socket.id}] - user[${author}] not in this channel(${channel})!`);
				throw new Error(`user[${author}] not in this channel(${channel})!`);
			}
			const tmpChannel = await this.chatService.getChannelPrimary(channel);
			if (!tmpChannel)
				throw new NotFoundException('Channel not found!');
			const tmpUser = await this.usersService.getUserPrimay({login: author});
			const createMessageDto: CreateMessageDto = {
				content: content,
				sentAt: new Date(),
				author: tmpUser,
				channel: tmpChannel,
			};
			const returnMessage = await this.chatService.createMessage(createMessageDto);
			delete returnMessage.channel;
			console.log(`Message recived: channel[${channel}] user[${author}] id[${returnMessage.id}]: content[${returnMessage.content}]`);
			this.server.to(channel).emit(`listenChannelMessage:${channel}`, returnMessage);
		} catch (err){
			console.log("CreateMessage Err: ", err.message);
			const notif = await this.usersService.createNotif(author, author, 'text', err.message);
			this.server.emit(`notif:${author}`, notif);
		}
	}

	// @SubscribeMessage('leaveChannel')
	// async handleLeaveChannel(
	// 	@Body() channel: {
	// 		name: string
	// 	},
	// 	@ConnectedSocket() socket: Socket)
	// {
	// 	try {
	// 		const user = await this.usersService.getData({socketId: socket.id});
	// 		if (socket.rooms.has(channel.name)){
	// 			socket.leave(channel.name);
	// 			console.log(`Channel: [${channel.name}] Leaved: [${socket.id}]`);
	// 		}
	// 	} catch (err) {
	// 		console.error("@SubscribMessage('leaveChannel'):", err.message);
	// 	}
	// }

	@SubscribeMessage('joinChannel')
	async handleJoinChannel(
		@Body() channel: {
			name: string
		},
		@ConnectedSocket() socket: Socket)
	{
		try
		{
			// const user = await this.usersService.getData({socketId: socket.id});
			const user = await this.usersService.getUserPrimay({socketId: socket.id});
			// const tmpChannel = await this.chatService.getChannel({name: channel.name, relation: 'members'});
			const tmpChannel = await this.chatService.getChannelRelation({
				channelName: channel.name,
				relation: {
					members: true,
				},
				primary: false,
			});
			if (!tmpChannel)
				throw (new NotFoundException("Channel not found!"));

			const userExists = await this.chatService.findChannelUser(tmpChannel, 'members', user);
			if (!userExists)
				throw (new NotFoundException("User is not in Channel!"));
			if (socket.rooms.has(channel.name))
				return (console.log(`[${socket.id}] already '${channel.name}' channel! :)`));
			socket.join(channel.name);
			if (user.socketId === socket.id) {
				console.log(`Channel: [${channel.name}] Joined: [${socket.id}]`);
				// this.server.to(channel.name).emit('BURAYA CHANNELIN MESAJ KISMINA BASTIRACAGIZ', `Channel(${channel.name}): ${socket.id} joined!`);
			}
		}
		catch (err)
		{
			console.error("@SubscribMessage('joinChannel'):", err.message);
		}
	}
	
	@SubscribeMessage('userStatus')
	async handleUserStatus(
		@Body() object: {status: 'online' | 'offline' | 'in-chat' | 'in-game' | 'afk'},
		@ConnectedSocket() socket: Socket
	){
		try {
			// const responseUser = await this.usersService.getData({socketId: socket.id})
			const responseUser = await this.usersService.getUserPrimay({socketId: socket.id});
			if (responseUser === null){
				throw (new NotFoundException("User not found!"));
			}
			console.log('Received userStatus:', `user[${responseUser.login}]`, `status[${object.status}]`);
			await this.usersService.patchUser(responseUser.login, object);
		} catch (err) {
			console.error("@SubscribMessage(userStatus):", err.message);
		}
	}

	@SubscribeMessage('markAllNotifsAsRead')
	async handleNotifsStatus(
		@ConnectedSocket() socket: Socket
	){
		try {
			// const responseUser = await this.usersService.getData({socketId: socket.id})
			const responseUser = await this.usersService.getUserPrimay({socketId: socket.id});
			if (responseUser === null){
				throw (new NotFoundException("User not found!"));
			}

			await this.usersService.notifsMarkRead(responseUser.login);
		} catch (err) {
			console.error("@SubscribMessage(markAllNotifsAsRead):", err);
		}
	}
}