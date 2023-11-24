// import { Module } from '@nestjs/common';
// // import { ChatGateway } from './chat.gateway';
// import { UsersModule } from 'src/users/users.module';

// @Module({
// 	imports: [UsersModule],
// 	// providers: [ChatGateway], // BAK BAK BU MAHLUKAT, AQ PROVIDERS'I 2 KERE CALISMASINI SAGLIYORMUS... 2 HAFTADIR BUNUNLA UGRASIYORUZ AQ.
// })
// export class ChatModule {}

// BU YUKARIDAKI chat.gateway.ts dosyasi.


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
import { Body } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';

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
	 *  {
	 * 		
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
	async handleJoinChannel(@Body() data: any,
			@ConnectedSocket() socket: Socket)
	{
		const	responseUser = await this.usersService.findOneSocket(socket);
		const	responseChannel = await this.chatService.findOneChannel(undefined, data.channel);
		if (responseChannel === null) {
			// Eger Channel bulunmaz ise 'null' dondurur ve Channel'i olusturur.
			const	createChannelDto: CreateChannelDto = {
				name: data.channel,
				type: data.type,
				users: [responseUser],
				admin: [responseUser],
				isActive: data.isActive,
				password: data.password,
			};
			const response = await (this.chatService.createChannel(createChannelDto));
			console.log("RESPONSEEEEEEEEEEE", response); // Basarili bir sekidle Channel olusturuldu mu onu kontrol edebiliriz.
		}
		// if (responseChannel.name === data.channel
		// 	&& responseChannel.users.find("sadfj") === socket.id)
		// {
		socket.join(data.channel);

		// }
		// socket.leave(data.channel); -> Bu; katilmis oldugu Channel'lerden ciktiysa(leave) o zaman yapacagiz.
		console.log(`${data.channel} kanalina katıldı: ${socket.id}`);
		this.server.to(data.channel).emit('messageToClient', `Channel(${data.channel}): ${socket.id} joined!`); }
}