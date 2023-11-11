// import { MessageBody, OnGatewayConnection, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
// import { Server } from 'http';

// @WebSocketGateway({
// 	cors: {
// 		origin: ["https://192.168.1.39:3000"],
// 	},
// })
// export class ChatGateway implements OnGatewayConnection {
// 	handleConnection(client: any, ...args: any[]) {
// 		console.log(client);
// 		throw new Error('Method not implemented.');
// 	}

// 	@WebSocketServer()
// 	server: Server;

// 	@SubscribeMessage("createMessage")
// 	handleCreateMessage(@MessageBody() data: any) {
// 		console.log("Create Message");
// 	}
// }










import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';

@WebSocketGateway(9090, {cors: "*"})
export class ChatGateway {
	@WebSocketServer()
	server;

	// handleMessage(client: any, payload: any): string {
	@SubscribeMessage('message')
	handleMessage(client: any, @MessageBody() message: string): void {
		console.log("runned: ");
		console.log(message);
		this.server.emit("message", message);
	}
}
