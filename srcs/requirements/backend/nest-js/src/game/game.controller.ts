import { Controller, Get, Post, Body, Patch, Delete, Query, Req, UseGuards, NotFoundException, UsePipes, ValidationPipe, Param, ParseBoolPipe } from '@nestjs/common';
import { GameService } from './game.service';
import { CreateGameDto } from './dto/create-game.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { Colors as C } from '../colors';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/entities/user.entity';
import { ChatGateway } from 'src/chat/chat.gateway';

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
		@Req() {user}:{user: User},
		@Param('name') name: string,
		@Param('lobby', ParseBoolPipe) lobby: boolean,
	){
		try {
			console.log(`${C.B_GREEN}GET: /room/:${name}: user[${user.login}]${C.END}`);
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
			if (game.isGameStarted && lobby)
				throw (new Error(`Game started. You can't enter lobby(${name})!`));
			delete game.password;
			return (game);
		} catch (err){
			console.log(`@Get('/room/:${name}`, err.message);
			return ({ success: false, err: err.message});
		}
	}

	// @Get('/lobby/:name')
	// async getGameLobby(
	// 	@Req() {user}:{user: User},
	// 	@Param('name') name: string,
	// ){
	// 	try {
	// 		console.log(`${C.B_GREEN}GET: /lobby/:${name}: user[${user.login}]${C.END}`);
	// 		const game = await this.gameService.getGameRelation({
	// 			name: name,
	// 			relation: {},
	// 			primary: true
	// 		});
	// 		if (!game)
	// 			throw new NotFoundException(`Game[${name}] not found!`);

	// 		if (!game.players.some((player) => player.id === user.id)) {
	// 			throw new NotFoundException(`User not found in game[${name}]`);
	// 		}
	// 		// if (!(user.id === game.pLeftId || user.id === game.pRightId)
	// 			if (game.isGameStarted)
	// 			throw (new Error(`Game started. You can't enter lobby(${name})!`));
	// 		delete game.password;
	// 		return (game);
	// 	} catch (err){
	// 		console.log(`@Get('/lobby/:${name}`, err.message);
	// 		return ({ success: false, err: err.message});
	// 	}
	// }

	// Get Game Room
	@Get('/room')
	async	getGameRooms(
		@Req() {user}:{user: User},
		@Query('room') room: string | undefined,
		@Query('relations') relations: string[] | undefined | 'all', //silinecek
	){
		try {
			console.log(`${C.B_GREEN}GET: /room: @Query('room'): [${room}], @Query('relations'): [${relations}]${C.END}`);
			const	tmpGameRoom = await this.gameService.findGameRoom(room, relations);
			if (!tmpGameRoom)
				return (`There is no GameRoom with '${room}' name`);

			if (relations === undefined){
				if (Array.isArray(tmpGameRoom)) {
					const extractedData = tmpGameRoom.map((game) => {
						const { name, mode, type, winScore, duration } = game;
						return { name, mode, type, winScore, duration };
					});
					return extractedData;
				}
				const { name, mode, type, winScore, duration } = tmpGameRoom;
				return { name, mode, type, winScore, duration };
			}
			return (tmpGameRoom);
		} catch (err) {
			console.log("@Get('/room'): ", err);
			return ({ success: false, err: err});
		}
	}

	@Post('/room/register')
	async registerGameRoom(
		@Req() {user},
		@Body() body: {room: string, password: string}
	){
		try
		{
			console.log(`${C.B_YELLOW}POST: /room/register: @Body(): [${body}]${C.END}`);
			const	responseRoom = await this.gameService.addGameRoomUser(user, body);
			this.chatGateway.server.emit('roomListener', responseRoom);

			// this.chatGateway.server.to() // Buraya odaya biri baglandi diye sadece odaya ozel olarak bir dinleme de yapabiliriz.

			return (responseRoom);
		}
		catch (err)
		{
			console.error("@Post('/channel/register'): registerChannel:", err.message);
			return ({err: err.message});
		}
	}

	// Create Game Room
	@Post('/room')
	// @UsePipes(new ValidationPipe())
	async	createGameRoom(
		@Req() {user},
		@Body() body: CreateGameDto,
	){
		try
		{
			console.log(`${C.B_YELLOW}POST: /room: @Body(): ${C.END}`, body);
			const	newGameRoom = await this.gameService.createGameRoom(user.login, body);
			return ({response: newGameRoom});
		}
		catch (err)
		{
			console.log("@Post('/room'): ", err);
			return ({err: err});
		}
	}

	// Update Game Room
	@Patch('/room')
	async	patchGameRoom(
		@Req() {user},
		@Query('room') room: string | undefined,
		@Body() body: Partial<CreateGameDto>,
	){
		try
		{
			// Admin harici bir seyleri degistirmeyi engelleme yapilabilinir. Yani admin kontrolu. (user)
			console.log(`${C.B_PURPLE}PATCH: /room: @Query('room'): [${room}] @Body(): [${C.END}`, body, ']');
			const	responseGameRoom = await this.gameService.patchGameRoom(room, body);
			const	singleRoom = Array.isArray(responseGameRoom) ? responseGameRoom[0] : responseGameRoom;
			if (singleRoom.isGameStarted)
				this.chatGateway.server.emit(`lobbyListener:${room}`, {action: 'startGame'});
			else
				this.chatGateway.server.emit(`lobbyListener:${room}`, singleRoom);
			return (singleRoom);
		}
		catch (err)
		{
			console.log("@Patch('/room'): ", err);
			return ({err: err});
		}
	}

	// @Put('/room')
	// async	putGameRoom()

	// Delete Game Room
	@Delete('/room')
	async	deleteGameRoom(
		@Req() {user},
		@Query('room') room: string | undefined,
	){
		try
		{
			console.log(`${C.B_RED}DELETE: /room: @Query('room'): [${room}]${C.END}`);
			const	responseGameRoom = await this.gameService.deleteGameRoom(room);
			return (responseGameRoom);
		}
		catch (err)
		{
			console.log("@Delete('/room'): ", err);
			return ({err: err});
		}
	}

	// @Get('/lobby/:roomName')
	// async getLobby(
	// 	@Req() {user},
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
