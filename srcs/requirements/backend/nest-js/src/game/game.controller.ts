import { Controller, Get, Post, Body, Patch, Delete, Query, Req, UseGuards, NotFoundException, Param, ParseBoolPipe } from '@nestjs/common';
import { GameService } from './game.service';
import { CreateGameDto } from './dto/create-game.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { Colors as C } from '../colors';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/entities/user.entity';
import { ChatGateway } from 'src/chat/chat.gateway';
import { Server, Socket } from 'socket.io';
import { GameAdminGuard } from './admin.game.guard';

@UseGuards(AuthGuard)
@Controller('/game')
export class GameController {
	constructor(
		private readonly usersService: UsersService,
		private readonly gameService: GameService,
		private readonly chatGateway: ChatGateway,
	) {}

	@Get('/room/:name/:lobby')
	async getGameRoom(
		@Req() { user }: { user: User },
		@Param('name') name: string,
		@Param('lobby', ParseBoolPipe) lobby: boolean,
	){
		try {
			console.log(`${C.B_GREEN}GET: /game/room/:${name}: user[${user.login}]${C.END}`);
			const game = await this.gameService.getGameRelation({
				name: name,
				relation: {},
				primary: true
			});
			if (!game)
				throw new NotFoundException(`Game[${name}] not found!`);

			if (!game.players.some((player) => player.id === user.id)) {
				throw new NotFoundException(`User not found in game[${name}]`);
			}
			if (game.running && lobby)
				throw (new Error(`Game started. You can't enter lobby(${name})!`));
			delete game.password;
			return (game);
		} catch (err){
			console.log(`@Get('/game/room/:${name}`, err.message);
			return ({ success: false, err: err.message});
		}
	}

	// Get Game Room
	@Get('/room')
	async	getGameRooms(
		@Req() { user }: { user: User },
		@Query('room') room: string | undefined,
		@Query('relations') relations: string[] | undefined | 'all',
	){
		try {
			console.log(`${C.B_GREEN}GET: /game/room: @Query('room'): [${room}], @Query('relations'): [${relations}]${C.END}`);
			const	tmpGameRoom = await this.gameService.findGameRoom(room, relations);
			if (!tmpGameRoom)
				return (`There is no GameRoom with '${room}' name`);

			if (relations === undefined){
				if (Array.isArray(tmpGameRoom)) {
					const extractedData = tmpGameRoom.map((game) => {
						const { name, mode, type, winScore, duration, description } = game;
						return { name, mode, type, winScore, duration, description };
					});
					return extractedData;
				}
				const { name, mode, type, winScore, duration, description } = tmpGameRoom;
				return { name, mode, type, winScore, duration, description };
			}
			return (tmpGameRoom);
		} catch (err) {
			console.log("@Get('/game/room'): ", err);
			return ({ success: false, err: err});
		}
	}

	@Post('/room/register')
	async registerGameRoom(
		@Req() { user },
		@Body() body: { room: string, password: string }
	){
		try
		{
			console.log(`${C.B_YELLOW}POST: /game/room/register: @Body(): [${body}]${C.END}`);
			const	responseRoom = await this.gameService.addGameRoomUser(user, body);
			this.chatGateway.server.emit(`lobbyListener:${body.room}`, responseRoom);
			const	socket = this.chatGateway.getUserSocket(user.id);
			socket.join(body.room);
			return (responseRoom);
		}
		catch (err)
		{
			console.error("@Post('/game/room/register'): registerGameRoom:", err.message);
			return ({err: err.message, status: err.status});
		}
	}

	// Create Game Room
	@Post('/room')
	// @UsePipes(new ValidationPipe())
	async	createGameRoom(
		@Req() { user },
		@Body() body: CreateGameDto,
	){
		try
		{
			console.log(`${C.B_YELLOW}POST: /game/room: @Body(): ${C.END}`, body);
			const	socket = this.chatGateway.getUserSocket(user.id);
			const	newGameRoom = await this.gameService.createGameRoom(user.login, body, socket);
			return ({response: newGameRoom});
		}
		catch (err)
		{
			console.log("@Post('/game/room'): ", err);
			return ({err: err});
		}
	}

	// Update Game Room
	@Patch('/room')
	async	patchGameRoom(
		@Req() { user },
		@Query('room') room: string | undefined,
		@Body() body: Partial<CreateGameDto>,
	){
		try
		{
			// Admin harici bir seyleri degistirmeyi engelleme yapilabilinir. Yani admin kontrolu. (user)
			console.log(`${C.B_PURPLE}PATCH: /game/room: @Query('room'): [${room}] @Body(): [${C.END}`, body, ']');
			const	responseGameRoom = await this.gameService.patchGameRoom(room, body);
			const	singleRoom = Array.isArray(responseGameRoom) ? responseGameRoom[0] : responseGameRoom;
			if (singleRoom.running)
				this.chatGateway.server.emit(`lobbyListener:${room}`, {action: 'startGame'});
			else
			{
				this.chatGateway.server.emit(`lobbyListener:${room}`, singleRoom);
			}
			return ({ success: true })
		}
		catch (err)
		{
			console.log("@Patch('/game/room'): ", err.message);
			return ({ err: err.message });
		}
	}

	@Delete('/room/leave')
	async	leaveGameLobby(
		@Req() { user },
		@Query('room') room: string | undefined,
	){
		try {
			console.log(`${C.B_RED}DELETE: /game/room/leave/:room: @Query('room'): [${room}]${C.END}`);
			const	responseLeaveGameLobby = await this.gameService.leaveGameLobby({
				room: room,
				user: user,
			});
			this.chatGateway.server.emit(`lobbyListener:${room}`, { action: 'leave' });
			return (responseLeaveGameLobby);
		} catch (err) {
			console.log("@Delete('/game/room/leave'): ", err.message);
			return ({ err: err.message });
		}
	}

	
	@UseGuards(GameAdminGuard)
	@Delete('/room/kick')
	async	kickGameLobby(
		@Req() { user },
		@Req() { game },
		@Query('targetUser') targetUser: string | undefined,
	){
		try
		{
			console.log(`${C.B_RED}DELETE: /game/room/kick: @Query('room'): [${targetUser}]${C.END}`);
			const	targetUserData: User = await this.usersService.getUserPrimary({login: targetUser});
			const	responseKickUser = await this.gameService.leaveGameLobby({
				room: game.name,
				user: targetUserData,
			});
			this.chatGateway.server.emit(`lobbyListener:${game.name}`, { action: 'leave' });
			return ({ message: `ADMIN (${user.login}): Kicked ${targetUser} from Game Lobby(${game.name})!` });
		}
		catch (err)
		{
			console.log("@Delete('/game/room/kick'): ", err.message);
			return ({err: err.message});
		}
	}

	// @Put('/room')
	// async	putGameRoom()

	// Delete Game Room
	@Delete('/room')
	async	deleteGameRoom(
		@Req() { user },
		@Query('room') room: string | undefined,
	){
		try
		{
			console.log(`${C.B_RED}DELETE: /game/room: @Query('room'): [${room}]${C.END}`);
			const	responseGameRoom = await this.gameService.deleteGameRoom(room);
			return (responseGameRoom);
		}
		catch (err)
		{
			console.log("@Delete('/game/room'): ", err.message);
			return ({err: err.message});
		}
	}

	// @Get('/lobby/:roomName')
	// async getLobby(
	// 	@Req() { user },
	// 	@Param('roomName') roomName: string,
	// ){
	// 	try
	// 	{
	// 		const	tmpGameRoom = await this.gameService.findGameRoom(roomName, "all");
	// 		if (!tmpGameRoom)
	// 			return (`There is no GameRoom with '${roomName}' name`);
	// 		return (tmpGameRoom);
	// 		return { success: true, message: `Joined the lobby: ${roomName} successfully.` };
	// 	} catch (err) {
	// 		console.log(`@Get('/lobby:${roomName}'): `, err);
	// 		return ({err: err});
	// 	}	
	// }
}
