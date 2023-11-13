import { MessageBody, OnGatewayConnection, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'http';

@WebSocketGateway({
	cors: {
		// origin: ["https://192.168.1.39:3000"],
		origin: "*",
	},
	namespace: "chat",
})
export class ChatGateway implements OnGatewayConnection {
	handleConnection(client: any, ...args: any[]) {
		console.log(client);
	}

	@WebSocketServer()
	server: Server;

	@SubscribeMessage("createMessage")
	handleCreateMessage(@MessageBody() data: any) {
		this.server.emit('messageToClient', data);
	}
}











// import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';

// @WebSocketGateway({
// 		cors: {
// 			// origin: ["https://192.168.1.39:3000"],
// 			origin: "*",
// 		},
// 		namespace: "chat",
// 	})
// export class ChatGateway {
// 	@WebSocketServer()
// 	server;

// 	// handleMessage(client: any, payload: any): string {
// 	@SubscribeMessage('createMessage')
// 	handleMessage(client: any, @MessageBody() message: string): void {
// 		console.log("Server Runned: ", message);
// 		this.server.emit("messageToClient", message);
// 	}
// }