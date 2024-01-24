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
import { Game } from 'src/game/entities/game.entity';


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
	// private gameRooms: Map<string, number> = new Map();
	private gameRoomData: Map<string, Game> = new Map();
	private gameRoomIntervals: Map<string, NodeJS.Timeout> = new Map();

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
		const	userData = await this.usersService.getUserRelation({
			user: { id: userId },
			relation: { currentRoom: true },
			primary: true,
		}, false);
		if (userData && userData.currentRoom)
		{
			if (userData.currentRoom.playerL.user.id === userData.id)
				await this.gameService.patchGameRoom(userData.currentRoom.name, {
					playerL: {
						...userData.currentRoom.playerL,
						user: {id: userData.id, login: userData.login, socketId: userData.socketId }
					},
				})
			else
				await this.gameService.patchGameRoom(userData.currentRoom.name, {
					playerR: {
						...userData.currentRoom.playerR,
						user: {id: userData.id, login: userData.login, socketId: userData.socketId }
					},
				})
		}
	}

	async handleDisconnect(client: Socket) {
		const clientId = client.id;
		await this.handleUserStatus({status: 'offline'}, client);
		console.log(`Client disconnected 💔: socket.id[${clientId}]`);
		const userId = this.connectedSockets.get(clientId);
		const userData = await this.usersService.getUserRelation({
			user: { socketId: client.id },
			relation: { currentRoom: true },
			primary: false,
		}, false);
		//--> oyun esnasında socket bağlantısı kopunca score göre sonuçlanıyor, çıkan kişiyi kaybettirmemiz lazım.
		if (userData && userData.currentRoom)
			await this.handleLeaveGameRoom(client, { gameRoom: userData.currentRoom.name });
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
			const messageDm = await this.chatService.getDmRelation(dm, {members: true, messages: true});
			if (!messageDm)
				throw new NotFoundException('Dm not found!');

			if (!socket.rooms.has(`dm-${dm}`)) {
				console.log(`Socket[${socket.id}] - user[${messageUser.login}] not in this dm(${dm})!`);
				throw new Error(`user[${messageUser.login}] not in this dm(${dm})!`);
			}

			const {id, login} = messageDm.usersData.find((member) => member.id !== author);

			const sourceUser = await this.usersService.getUserRelation({
				user: {id: author},
				relation: {blockUsers: true},
				primary: false,
			})

			if (sourceUser.blockUsers.some((user) => user.id === id)){
				throw new Error(`You blocked user[${login}], can't send message!`);
			}
			const targetUser = await this.usersService.getUserRelation({
				user: {id: id},
				relation: {blockUsers: true},
				primary: false,
			});
			if (targetUser.blockUsers.some((user) => user.id === user.id)){
				throw new Error(`user[${login}] blocked you, can't send message!`);
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

	// @Interval(1000)
	async	startDuration(
		gameRoomData: Game
	){
		if (!gameRoomData)
			return ;
		if (gameRoomData.duration <= 0)
		{
			clearInterval(this.gameRoomIntervals.get(gameRoomData.name));
			return ;
		}
		gameRoomData.duration--;
	}

	async	finishGame(
		gameRoom: string,
		socketLeave?: Socket,
	){
		const	gameData = this.gameRoomData.get(gameRoom);
		if (!gameData)
			return ;
		console.log(`GAME IS FINISHED ${gameRoom}`);

		if (socketLeave && socketLeave.id === gameData.playerL.user.socketId)
		{
			gameData.playerL.score = 0;
			gameData.playerR.score = 1;
		}
		else if (socketLeave && socketLeave.id === gameData.playerR.user.socketId)
		{
			gameData.playerL.score = 1;
			gameData.playerR.score = 0;
		}

		let result = (gameData.playerL.score > gameData.playerR.score
			? `🏆🎖️ WINNER '${gameData.playerL.user.login}' 🏆🎖️`
			: (gameData.playerL.score < gameData.playerR.score)
				? `🏆🎖️ WINNER '${gameData.playerR.user.login}' 🏆🎖️`
				: `⏰ TIME IS UP! TIE ⏲️`)

		this.server.to(gameRoom).emit('finishGameData', {
			result: result,
		});
		this.server.in(gameRoom).socketsLeave(gameRoom);
		const	deleteGameRoomDB = await this.gameService.deleteGameRoom(gameRoom);
		const	deleteGameData = this.gameRoomData.delete(gameRoom);
		this.usersService.createGameHistory(
			gameData.playerL.user.id,
			gameData.playerR.user.id,
			gameData.playerL.score,
			gameData.playerR.score,
			gameRoom
		);
	}

	@SubscribeMessage(`joinGameRoom`)
	async handleJoinGameRoom(
		@ConnectedSocket() socket: Socket,
		@MessageBody() data: { gameRoom: string },
	){
		if (!socket.rooms.has(data.gameRoom))
		{
			console.log(`Socket[${socket.id}] oyun odasin bagli degil bagliyoruz. gameRoom -> ${data.gameRoom}`);
			socket.join(data.gameRoom);
		}
		if (!this.gameRoomData.has(data.gameRoom))
		{
			const	gameData = await this.gameService.findGameRoom(data.gameRoom);
			const	singleGameData = Array.isArray(gameData) ? gameData[0] : gameData;
			this.gameRoomData.set(data.gameRoom, singleGameData);
			if (this.gameRoomIntervals.get(data.gameRoom))
				return ;
			const intervalId = setInterval(() => {
				this.startDuration(this.gameRoomData.get(data.gameRoom));
			}, 1000);
			this.gameRoomIntervals.set(data.gameRoom, intervalId);
		}
	}

	@SubscribeMessage('calcGameData')
	async handleCalcGameData(
		// @ConnectedSocket() socket: Socket,
		@MessageBody()
		{ gameRoom }:
			{ gameRoom: string }
	){
		const	denemeData = this.gameRoomData.get(gameRoom);
		const	returnData = await this.gameService.calcGameLoop(denemeData);
		if (returnData && returnData.running)
			this.server.to(gameRoom).emit(`updateGameData`, {action: returnData});
		else
		{
			this.server.to(gameRoom).emit(`updateGameData`, {action: returnData});
			this.finishGame(gameRoom);
		}
	}

	/**
	 * Oyun odasina baglandiktan sonra gelen komutlari burada
	 *  ele aliyouz.
	 */
	@SubscribeMessage('commandGameRoom')
	async handleCommandGameRoom(
		@ConnectedSocket() socket: Socket,
		@MessageBody() 
		{ gameRoom, way, isKeyPress }:
			{ gameRoom: string, way: string, isKeyPress: boolean})
	{
		console.log("TUSA BASILDI ->>>>>>", gameRoom, way, isKeyPress);
		const	gd = this.gameRoomData.get(gameRoom);
		if (!gd || !gd.playerL.user.socketId || !gd.playerR.user.socketId)
			return ;
		let katsayi: number = 1;
		if (gd.mode === 'fast-mode')
			katsayi = 1.5;
		if (socket.id === gd.playerL.user.socketId)
		{
			if (isKeyPress) // true -> tusa basilmissa 10 -> up = +10 -> down = -10
			{
				gd.playerL.speed = -10 * katsayi;
				if (way === 'DOWN')
					gd.playerL.speed *= -1;
			}
			else // false -> tustan parmagini cektiginde
				gd.playerL.speed = 0;
		}
		else
		{
			if (isKeyPress) // true -> tusa basilmissa 10 -> up = +10 -> down = -10
			{
				gd.playerR.speed = -10 * katsayi;
				if (way === 'DOWN')
					gd.playerR.speed *= -1;
			}
			else // false -> tustan parmagini cektiginde
				gd.playerR.speed = 0;
		}
	}

	/**
	 * Oyun odasindan cikis yaparken socket baglantisini kesmek icin.
	 * @param gameRoom 
	 * @param socket 
	 */
	@SubscribeMessage('leaveGameRoom')
	async handleLeaveGameRoom(
		@ConnectedSocket() socket: Socket,
		@MessageBody() data: { gameRoom: string, isTie?: boolean },
	){
		if (!data || !data.gameRoom)
			return ;
		if (socket.rooms.has(data.gameRoom) || this.connectedSockets.has(socket.id))
			this.finishGame(data.gameRoom, socket);
		else
			console.log(`${socket.id} zaten ${data.gameRoom} oyun odasinda degil! :D?`);
	}
}