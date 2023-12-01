/**
 * LINK: https://dzone.com/articles/build-a-real-time-chat-application-with-nestjs-and-postgresql
 */
import { ConnectedSocket, MessageBody,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { CreateChannelDto } from './dto/chat-channel.dto';
import { ChatService } from './chat.service';
import { Body, NotFoundException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/entities/user.entity';
import { Channel } from './entities/chat.entity';

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
export class ChatGateway {
	constructor(
		private readonly chatService: ChatService,
		private readonly usersService: UsersService
	) {}

	@WebSocketServer()
	server;

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
	handleConnection(client: Socket, ...args: any[]) {
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
		//Do stuffs
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
			{ channel, message }:
				{ channel: string, message: string })
	{
		console.log(`BACKEND: gelen msg[${count++}]:`, message);
		console.log('MessageBody():', {channel, message});
		this.server.to(channel).emit("messageToClient", message);
	}

	@SubscribeMessage('joinChannel')
	// async handleJoinChannel(@MessageBody() channel: string,
	async handleJoinChannel(@Body() formData: any,
			@ConnectedSocket() socket: Socket) {
		const	responseUser: User | null = await this.usersService.findOneSocket(socket);
		if (responseUser === null)
			return (new NotFoundException("ERROR: User not found for create Channel!"))
		const	responseChannel: Channel | Channel[] | any = await this.chatService.findChannel(formData.name);
		if (responseChannel === null) {
			// Eger Channel bulunmaz ise 'null' dondurur ve Channel'i olusturur.
			const	createChannelDto: CreateChannelDto = {
				name: formData.name as string,
				type: formData.type as string,
				password: formData.password as string,
				image: null,
				users: [responseUser],
				admins: [responseUser],
			};
			console.log("atandiktansonra: ", createChannelDto);
			const response = await this.chatService.createChannel(createChannelDto);
			console.log(response, `ADMIN: ${socket.id}`); // Basarili bir sekidle Channel olusturuldu mu onu kontrol edebiliriz.
			socket.join(formData.name);
			this.server.to(formData.name).emit('messageToClient', `Channel(${formData.name}) created: ${socket.id} you are admin!`);
		}
		else if (responseChannel !== null
			&& responseChannel.name === formData.name)
		{
			if (!socket.rooms.has(formData.name))
			{
				socket.join(formData.name);
				if (responseUser.socket_id === socket.id) {
					console.log(`${formData.name} kanalina katıldı: ${socket.id}`);
					this.server.to(formData.name).emit('messageToClient', `Channel(${formData.name}): ${socket.id} joined!`);
				}
			}
			else
			{
				console.log(`${socket.id} zaten ${formData.name} kanalında! :)`);
				// this.server.to(formData.name).emit('messageToClient', `Channel(${formData.name}): ${socket.id} joined!`);
			}
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