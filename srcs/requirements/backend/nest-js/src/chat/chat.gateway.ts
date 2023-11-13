import { MessageBody, OnGatewayConnection, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'http';
// import { UsersService } from 'src/users/users.service';

@WebSocketGateway({
	cors: {
		// origin: ["https://192.168.1.39:3000"],
		origin: "*",
	},
	namespace: "chat",
})
export class ChatGateway implements OnGatewayConnection {
	// constructor(private readonly usersService: UsersService) {}

	handleConnection(client: any, ...args: any[]) {
		console.log(client);
	}

	@WebSocketServer()
	server: Server;

	@SubscribeMessage("createMessage")
	async handleCreateMessage(@MessageBody() data: any) {
		// const user = await this.usersService.findOne(1); // Kullanıcı ID'si burada sabit olarak 1 alındı.
		// const messageWithUser = {...data, login: user.login, image: JSON.stringify(user.image)};
		// const	messageWithUser = {message: data, login: user.login};
		
		// console.log("backend data->:" + JSON.stringify(messageWithUser));
		
		// this.server.emit('messageToClient', messageWithUser);
		this.server.emit('messageToClient', data);
	}
}


/**
 * NOT: Channel'e bagli biri varsa o channel'deki socket id'sine karsilik gelen
 *  "fBshWt$#4sFhhDw" gibi bir seye 'login' datasini da ekle, o id'ye karsilik
 *  gelene print ederken o login ismini koy.
 */