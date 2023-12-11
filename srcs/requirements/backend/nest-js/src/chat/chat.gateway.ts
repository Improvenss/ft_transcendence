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
import { CreateChannelDto } from './dto/chat-channel.dto';
import { ChatService } from './chat.service';
import { Body, NotFoundException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/entities/user.entity';
import { Channel } from './entities/chat.entity';
import * as bcrypt from 'bcrypt';
import { handleCreateChannel } from './channel.handler';
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
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {	constructor(
		private readonly chatService: ChatService,
		private readonly usersService: UsersService
	) {}

	private connectedUsers: Map<string, Socket> = new Map();

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
	}

	// joinChannel(channel: Channel){
	// joinChannel(name: string){ //1 kere çalışıyor, o da kanal oluşturunca 
	// 	// Socket.IO'nun sağladığı join fonksiyonunu kullanarak kanala katılma işlemi
	// 	// this.server.socketsJoin(channel.name);
	// 	console.log(`Client joined channel: [${name}]`);
	// 	this.server.socketsJoin(name);
	// }

	// @SubscribeMessage('joinChannel')
	// async joinChannel(@Body() channel: {name: string},
	// 	@ConnectedSocket() socket: Socket)
	// {
	// 	const	responseUser: User | null = await this.usersService.findOneSocket(socket);
	// 	if (responseUser === null)
	// 		return (new NotFoundException("ERROR: User not found for create game room!"))
	// 	console.log("Joined new room:",channel);
	// 	socket.join(channel.name);
	// 	// this.server.to(channel).emit('channelListener', `Joined ${channel} room`); 
	// 	// this.server.socketsJoin(channel);
	// }

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
	@SubscribeMessage('joinGameRoom')
	async handleJoinGameRoom(@Body() roomData: any,
		@ConnectedSocket() socket: Socket)
	{
		const	responseUser: User | null = await this.usersService.findOneSocket(socket);
		if (responseUser === null)
			return (new NotFoundException("ERROR: User not found for create game room!"))
		socket.join(roomData.name);
		console.log(`GAME: Socket joined: ${roomData.name}, ${responseUser.login}(${socket.id})`);
		this.server.to(roomData.name).emit("gameRoomJoinListener",
			`GAME: Socket joined: ${roomData.name}, ${socket.id}`);
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
		{ channel, author, message }:
			{ channel: Channel, author: User, message: string }
	){
		try {
			const tmpChannel: Channel | Channel[] | any = await this.chatService.findChannel(channel.name);
			const tmpUser: User = await this.usersService.findOne(null, author.login);

			const createMessageDto: CreateMessageDto = {
				message: message,
				sentAt: new Date(),
				author: tmpUser,
				channel: tmpChannel,
			};
			// console.log("createMessageDto:", createMessageDto);
			const response = await this.chatService.createMessage(createMessageDto);

			const returnMessage = {
				sender: createMessageDto.author,
				content: createMessageDto.message,
				timestamp: createMessageDto.sentAt,
			}
			console.log("Message Save response:", response, returnMessage);
			this.server.to(channel.name).emit("listenChannelMessage", returnMessage);
		} catch (err){
			console.log("CreateMessage Err: ", err);
		}		
	}
	// async handleMessage(
	// 		@MessageBody() 
	// 		{ channel, message }:
	// 			{ channel: string, message: string })
	// {
	// 	console.log(`BACKEND: gelen msg[${count++}]:`, message);
	// 	console.log('MessageBody():', {channel, message});
	// 	this.server.to(channel).emit("messageToClient", message);
	// }

	@SubscribeMessage('joinChannel')
	async handleJoinChannel(@Body() channel: {name: string},
		@ConnectedSocket() socket: Socket)
	{
		try
		{
			console.log("Socket'in Channel'a joinlenme kismi - joinChannel -");
			const responseUser: User | null = await this.usersService.findOneSocket(socket);
			if (responseUser === null)
				throw (new NotFoundException("ERROR: User not found for create Channel!"))
			const responseChannel: Channel | Channel[] | any = await this.chatService.findChannel(channel.name, ['members']);
			if (responseChannel === null)
				throw (new NotFoundException("Channel not found!"));
			const ifUserInChannel = await this.chatService.findChannelUser(responseChannel, responseUser);
			if (!ifUserInChannel)
				throw (new NotFoundException("User is not in Channel!"));
			else if (responseChannel !== null
				&& responseChannel.name === channel.name)
			{
				if (socket.rooms.has(channel.name))
					return (console.log(`${socket.id} zaten ${channel.name} kanalında! :)`));
				socket.join(channel.name);
				if (responseUser.socketId === socket.id) {
					console.log(`${channel.name} kanalina katıldı: ${socket.id}`);
					this.server.to(channel.name).emit('BURAYA CHANNELIN MESAJ KISMINA BASTIRACAGIZ', `Channel(${channel.name}): ${socket.id} joined!`);
				}
			}
			else
				throw (new Error("Socket: 'joinChannel': Unexpected error!"));
		}
		catch (err)
		{
			console.error("@SubscribMessage('joinChannel'):", err);
		}
	}

	@SubscribeMessage('leaveChannel')
	async handleLeaveChannel(@Body() data: any,
		@ConnectedSocket() socket: Socket)
	{
		// users[] kimse kalmamasi lazim cikan cikacak.
		// admins[] ciksalar bile adminler kalacak.
		if (socket.rooms.has(data.channel))
		{
			this.server.to(data.channel).emit('messageToClient', `Channel(${data.channel}): ${socket.id} left the channel!`);
			socket.leave(data.channel)
			console.log(`${data.channel} kanalindan cikti: ${socket.id}`);
		}
		else
			console.log(`${socket.id} zaten ${data.channel} kanalinda degil! :D?`);
	}
	
		// socket.leave(data.channel); -> Bu; katilmis oldugu Channel'lerden ciktiysa(leave) o zaman yapacagiz.
}