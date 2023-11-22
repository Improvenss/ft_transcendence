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
import { Server, Socket } from 'socket.io';

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
	 *  https://10.12.14.8:3000/chat -> createMessage -> compose message: '{Postman}
	 * @param param0 
	 */
	@SubscribeMessage('createMessage')
	async handleMessage(@MessageBody() { channel, message }: { channel: string, message: string }) {
		console.log(`BACKEND: gelen msg[${count++}]:`, message);
		console.log('MessageBody():', {channel, message});
		this.server.to(channel).emit("messageToClient", message);
	}

	@SubscribeMessage('joinChannel')
	async handleJoinChannel(@MessageBody() channel: string, @ConnectedSocket() socket: Socket) {
		socket.join(channel);
		console.log(`${channel} kanalina katıldı: ${socket.id}`);
		this.server.to(channel).emit('messageToClient', `Channel(${channel}): ${socket.id} joined!`);
		socket.on('messageToChannel', (message) => {
			this.server.to(channel).emit('messageToClient', message);
		});
	}
}

// const io = require('socket.io')({
// 	cors: {
// 		origin: "*",
// 	}
// 	 });
	
// 	io.on('connection', (socket) => {
// 	console.log('client.id: ', socket.id);
// 	console.log('client handshake addr: ', socket.handshake.address);
// 	console.log('client handshake time: ', socket.handshake.time);
// 	console.log('client handshake query: ', socket.handshake.query);
	
// 	socket.on('createMessage', (data) => {
// 		console.log('BURAYA KAC KERE GIRDIN AQ');
// 		io.emit('messageToClient', data);
// 	});
// 	 });