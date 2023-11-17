import { MessageBody,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer } from '@nestjs/websockets';

var count: number = 0;

@WebSocketGateway({ 
	cors: {
		origin: "*",
	},
})
export class ChatGateway {
	@WebSocketServer()
	server;

	@SubscribeMessage('createMessage')
	handleMessage(@MessageBody() message: string) {
		console.log(`BACKEND: gelen msg[${count++}]:`, message);
		this.server.emit("messageToClient", message);
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
