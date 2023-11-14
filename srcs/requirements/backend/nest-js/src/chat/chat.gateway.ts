import { MessageBody, OnGatewayConnection, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UsersService } from 'src/users/users.service';

@WebSocketGateway({
	cors: {
		origin: "*",
	},
	namespace: "/chat",
})
export class ChatGateway implements OnGatewayConnection {
	constructor(private readonly usersService: UsersService) {}

	// Burada 'server' ile baglanan 'client'in baglandiktan sonra socket'in bilgilerini yazabiliyoruz.
	handleConnection(client: any, ...args: any[]) {
		// const loginName = getClientLoginName(client); // Giriş adınızı almak için kendi mantığınızı ekleyin
		// console.log(`İstemci bağlandı - ID: ${client.id}, Giriş: ${loginName}`);
		// console.log(client);
		console.log("client.id: ", client.id);
		// console.log("client.nsp.sockets: ", client.nsp.sockets);
		console.log("client handshake addr: ", client.handshake.address);
		console.log("client handshake time: ", client.handshake.time);
		console.log("client handshake query: ", client.handshake.query);
	}
	
	@WebSocketServer()
	server: Server;

	// @SubscribeMessage("createMessage")
	// async handleCreateMessage(@MessageBody() data: any) {
	// 	// const user = await this.usersService.findOne(1); // Kullanıcı ID'si burada sabit olarak 1 alındı.
	// 	// const messageWithUser = {...data, login: user.login, image: JSON.stringify(user.image)};
	// 	// const	messageWithUser = {message: data, login: user.login};
		
	// 	// console.log("backend data->:" + JSON.stringify(messageWithUser));
		
	// 	// this.server.emit('messageToClient', messageWithUser);
	// 	this.server.emit('messageToClient', data);
	// }

	@SubscribeMessage("createMessage")
	async handleCreateMessage(@MessageBody() data: any) {
		// const loginName = await this.usersService.findOne(1); // Kullanıcı ID'si burada sabit olarak 1 alındı.
		// const messageWithUser = { message: data, login: loginName };

		// console.log(`${loginName} tarafından gelen mesaj: ${data}`);
		// this.server.emit('messageToClient', messageWithUser);
		this.server.emit('messageToClient', data);
	}

	@SubscribeMessage('joinRoom')
	handleJoinRoom(client: Socket, room: string) {
		client.join(room);
		client.emit('joinedRoom', room);
	}

	@SubscribeMessage('leaveRoom')
	handleLeaveRoom(client: Socket, room: string) {
		client.leave(room);
		client.emit('leftRoom', room);
	}

	@SubscribeMessage('chatToRoom')
	handleChatToRoom(client: Socket, { room, message }: { room: string; message: string }) {
		this.server.to(room).emit('chatToClient', message);
	}
}


/**
 * NOT: Channel'e bagli biri varsa o channel'deki socket id'sine karsilik gelen
 *  "fBshWt$#4sFhhDw" gibi bir seye 'login' datasini da ekle, o id'ye karsilik
 *  gelene print ederken o login ismini koy.
 */

/**
 * İstemci Kimliği (Client ID): client.id - Her bağlı istemci için benzersiz bir tanımlayıcıdır. Bu, farklı istemciler arasında ayırma yapmak için kullanılabilir.

İstemcinin IP Adresi: client.handshake.address - Bağlı istemcinin IP adresini sağlar. Kayıt ve güvenlik amaçları için kullanışlı olabilir.

Bağlantı Zaman Damgası: client.handshake.time - Bağlantının ne zaman kurulduğu hakkında bir zaman damgası sağlar. Kullanıcıların sohbete ne zaman katıldığını takip etmek için kullanılabilir.

Sorgu Parametreleri: client.handshake.query - Bağlantı sırasında gönderilen sorgu parametrelerini içeren bir nesnedir. Bu durumda, EIO, taşıma ve t gibi bilgileri içerir.
 */

/**
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Server } from 'socket.io';
import { createServer } from 'http';

@Injectable()
export class ChatGateway implements OnModuleInit {
private server: Server;

onModuleInit() {
	const httpServer = createServer();
	this.server = new Server(httpServer, {
	path: "/chat",
	cors: {
		origin: "*",
	},
	});

	this.server.on('connection', (socket) => {
	console.log('client.id: ', socket.id);
	console.log('client handshake addr: ', socket.handshake.address);
	console.log('client handshake time: ', socket.handshake.time);
	console.log('client handshake query: ', socket.handshake.query);

	socket.on('createMessage', (data: any) => {
		this.server.emit('messageToClient', data);
	});

	socket.on('joinRoom', (room: string) => {
		socket.join(room);
		socket.emit('joinedRoom', room);
	});

	socket.on('leaveRoom', (room: string) => {
		socket.leave(room);
		socket.emit('leftRoom', room);
	});

	socket.on('chatToRoom', ({ room, message }: { room: string; message: string }) => {
		this.server.to(room).emit('chatToClient', message);
	});
	});

}
}

 */