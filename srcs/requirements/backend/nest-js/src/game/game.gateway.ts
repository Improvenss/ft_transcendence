import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Body, NotFoundException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { GameService } from 'src/game/game.service';

var count: number = 0;

@WebSocketGateway({
	cors: {
		origin: "*",
	},
	namespace: '/game'
})

export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect
{
	constructor(
		private readonly usersService: UsersService,
		private readonly gameService: GameService,
	) {}

	public connectedUsers: Map<string, Socket> = new Map();

	@WebSocketServer()
	server: Server;

	handleConnection(client: Socket, ...args: any[])
	{
		this.connectedUsers.set(client.id, client);
		console.log(`Client game connected ✅: socket.id[${client.id}]`);
	}
	handleDisconnect(client: Socket) {
		console.log(`Client game disconnected 💔: socket.id[${client.id}]`);
		this.connectedUsers.delete(client.id);
	}

	/**
	 * Oyun odasina baglandiktan sonra gelen komutlari burada
	 *  ele aliyouz.
	 * @param param0 
	 */
	@SubscribeMessage('commandGameRoom')
	async handleCommandGameRoom(
		@MessageBody() 
		{ gameRoom, command }:
			{ gameRoom: string, command: string })
	{
		console.log(`GAME ROOM: gelen command[${count++}]:`, command);
		console.log('GAME ROOM: MessageBody():', {gameRoom, command});
		this.server.to(gameRoom).emit("gameRoomCommandListener", command);
	}

	/**
	 * Oyun odasini burada olusturuyoruz.
	 * @param roomData 
	 * @param socket 
	 * @returns 
	 */
	@SubscribeMessage('joinGameRoom')
	async handleJoinGameRoom(
		@Body() roomData: {
			name: string,
		},
		@ConnectedSocket() socket: Socket)
	{
		try
		{
			console.log("Socket'in Game Room'a joinlenme kismi - joinRoom -");
			const responseUser = await this.usersService.getUserPrimary({socketId: socket.id});
			if (responseUser === null)
				throw (new NotFoundException("User not found for join Game Room!"));
			const singleUser = Array.isArray(responseUser) ? responseUser[0] : responseUser;
			const responseRoom = await this.gameService.findGameRoom(roomData.name, ['members']);
			const singleRoom = Array.isArray(responseRoom) ? responseRoom[0] : responseRoom;
			if (Array.isArray(responseRoom) ? responseRoom.length === 0 : responseRoom === null)
				throw (new NotFoundException("Game Room not found!"));
			

			else if (singleRoom !== null
				&& singleRoom.name === roomData.name)
			{
				if (socket.rooms.has(roomData.name))
					return (console.log(`[${socket.id}] alredy '${roomData.name}' room.! :)`));
				socket.join(roomData.name);
				if (singleUser.socketId === socket.id) {
					console.log(`Room: '${roomData.name}' Joined: [${socket.id}]`);
					this.server.to(roomData.name).emit('BURAYA ROOMUN MESAJ KISMINA BASTIRACAGIZ', `Room(${roomData.name}): ${socket.id} joined!`);
				}
			}
			else
				throw (new Error("Socket: 'joinGameRoom': Unexpected error!"));
		}
		catch (err)
		{
			console.error("@SubscribMessage('joinGameRoom'):", err);
		}
	}

	/**
	 * Oyun odasindan cikis yaparken socket baglantisini kesmek icin.
	 * @param roomData 
	 * @param socket 
	 */
	@SubscribeMessage('leaveGameRoom')
	async handleLeaveGameRoom(@Body() roomData: any,
		@ConnectedSocket() socket: Socket)
	{
		console.log(`Leaving from backend-E>${socket.id}<3-`);
		if (socket.rooms.has(roomData.name))
		{
			// this.server.to(roomData.name).emit('messageToClient', `Game(${roomData.name}): ${socket.id} left the channel!`);
			socket.leave(roomData.name)
			console.log(`${roomData.name} odasindan cikti: ${socket.id}`);
		}
		else
		{
			console.log(`${socket.id} zaten ${roomData.name} oyun odasinda degil! :D?`);
		}
	}
	@SubscribeMessage('userStatus')
	async handleUserStatus(
		@Body() object: {status: 'online' | 'offline' | 'in-chat' | 'in-game' | 'afk'},
		@ConnectedSocket() socket: Socket
	){
		try {

			const responseUser = await this.usersService.getUserPrimary({socketId: socket.id});
			if (responseUser === null){
				throw (new NotFoundException("User not found!"));
			}
			const singleUser = Array.isArray(responseUser) ? responseUser[0] : responseUser;
			console.log('Received userStatus:', `user[${singleUser.login}]`, `status[${object.status}]`);
			// await this.usersService.patchUser(responseUser[0], object);
			await this.usersService.updateUser({id: singleUser.id, status: object.status});
		} catch (err) {
			console.error("@SubscribMessage(userStatus):", err);
		}
	}
	@SubscribeMessage('gamekeydown')
	async playerKeyDown(@MessageBody() gameMessage: any,
		@ConnectedSocket() socket: Socket)
	{
		console.log("->" + socket.id + "<----------------------------");
		console.log("Gaballayıveremeyebileceklerimizdendeymişcesine->" + gameMessage + "<-");

	}
}