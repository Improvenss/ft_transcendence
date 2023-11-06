import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';

@WebSocketGateway(9090, {cors: "*"})
export class ChatGateway {
	@WebSocketServer()
	server;

	// handleMessage(client: any, payload: any): string {
	@SubscribeMessage('message')
	handleMessage(@MessageBody() message: string): void {
		console.log("runned: ");
		console.log(message);
		this.server.emit("message", message);
	}
}
