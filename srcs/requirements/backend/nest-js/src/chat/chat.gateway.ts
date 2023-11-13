import { MessageBody, OnGatewayConnection, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'http';
// import * as fs from 'fs';
import { UsersService } from 'src/users/users.service';

@WebSocketGateway({
	cors: {
		// origin: ["https://192.168.1.39:3000"],
		origin: "*",
	},
	namespace: "chat",
})
export class ChatGateway implements OnGatewayConnection {
	constructor(private readonly usersService: UsersService) {}

	// Burada 'server' ile baglanan 'client'in baglandiktan sonra socket'in bilgilerini yazabiliyoruz.
	handleConnection(client: any, ...args: any[]) {
		// const loginName = getClientLoginName(client); // Giriş adınızı almak için kendi mantığınızı ekleyin
		// console.log(`İstemci bağlandı - ID: ${client.id}, Giriş: ${loginName}`);
		console.log(client);
		console.log("client.id: ", client.id);
		console.log(client.handshake.address);
		// client.handshake.time
		// client.handshake.query
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