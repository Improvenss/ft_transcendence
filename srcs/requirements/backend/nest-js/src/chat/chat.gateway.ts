// import { Module } from '@nestjs/common';
// // import { ChatGateway } from './chat.gateway';
// import { UsersModule } from 'src/users/users.module';

// @Module({
// 	imports: [UsersModule],
// 	// providers: [ChatGateway], // BAK BAK BU MAHLUKAT, AQ PROVIDERS'I 2 KERE CALISMASINI SAGLIYORMUS... 2 HAFTADIR BUNUNLA UGRASIYORUZ AQ.
// })
// export class ChatModule {}

// BU YUKARIDAKI chat.gateway.ts dosyasi.


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

	@SubscribeMessage('createMessage')
	async handleMessage(@MessageBody() { channel, message }: { channel: string, message: string }) {
		console.log(`BACKEND: gelen msg[${count++}]:`, message);
		this.server.to(channel).emit("messageToClient", message);
	}

	@SubscribeMessage('joinChannel')
	async handleJoinChannel(@MessageBody() channel: string, @ConnectedSocket() socket: Socket) {
		socket.join(channel);
		console.log(`${channel} kanalina katıldı: ${socket.id}`);
		this.server.to(channel).emit('messageToClient', `Channel(${channel}): ${socket.id} joined!`);

		// socket.on('messageToChannel', (message) => {
		// 	this.server.to(channel).emit('messageToClient', message);
		// });
	}
}

// import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
// import { Server, Socket } from 'socket.io';

// var count: number = 0;
// var count2: number = 0;

// @WebSocketGateway({ 
// 	cors: {
// 		origin: "*",
// 	},
// 	namespace: "/chat",
// })
// export class ChatGateway {
// 	@WebSocketServer()
// 	server: Server;
// 	@SubscribeMessage('message')
// 	handleMessage(@MessageBody() message: string) {
// 		console.log(`BACKEND: gelen msg[${count++}]:`, message);
// 		this.server.emit("messageToClient", message);
// 	}
// 	@SubscribeMessage('message2')
// 	handleMessage2(@MessageBody() message: string) {
// 		console.log(`BACKEND: gelen 2 msg[${count2++}]:`, message);
// 		this.server.emit("messageToClient", message);
// 	}
// }









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




// import { MessageBody,
// 	SubscribeMessage,
// 	WebSocketGateway,
// 	WebSocketServer } from '@nestjs/websockets';

// @WebSocketGateway({ 
// 	cors: {
// 		origin: "*",
// 	},
// 	namespace: "/chat",
// })
// export class ChatGateway {
// 	@WebSocketServer()
// 	server;

// 	@SubscribeMessage("message")
// 	async handleCreateMessage(@MessageBody() data: any) {
// 		console.log("BURAYA KAC KERE GIRDIN AQ");
// 		this.server.emit('messageToClient', data);
// 	}

// }
