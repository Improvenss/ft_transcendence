import { Controller, Get, Post, Body, Patch, Delete, Query, Req, UseGuards, NotFoundException, UsePipes, ValidationPipe } from '@nestjs/common';
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

	// Get Game Room
	@Get('/room')
	async	getGameRoom(
		@Req() {user},
		@Query('room') room: string | undefined,
		@Query('relations') relations: string[] | null | 'all',
	){
		try
		{
			console.log(`${C.B_GREEN}GET: /room: @Query('room'): [${room}], @Query('relations'): [${relations}]${C.END}`);
			const	tmpGameRoom = await this.gameService.findGameRoom(room, relations);
			if (!tmpGameRoom)
				return (`There is no GameRoom with '${room}' name`);
			return (tmpGameRoom);
		}
		catch (err)
		{
			console.log("@Get('/room'): ", err);
			return ({err: err});
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
			const	responseRoom = await this.gameService.addGameRoomUser(user.login, body);
			this.chatGateway.server.emit('roomListener');
			// this.chatGateway.server.to() // Buraya odaya biri baglandi diye sadece odaya ozel olarak bir dinleme de yapabiliriz.
			return (responseRoom);
			//return ({response: true, message: `${user.login} registered in this ${room}.`});
		}
		catch (err)
		{
			console.error("@Post('/channel/register'): registerChannel:", err);
			return ({warning: err});
		}
	}

	// Create Game Room
	@Post('/room')
	@UsePipes(new ValidationPipe())
	async	createGameRoom(
		@Req() {user},
		@Body() body: CreateGameDto,
	){
		try
		{
			console.log(`${C.B_YELLOW}POST: /room: @Body(): [${body}]${C.END}`);
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
			console.log(`${C.B_PURPLE}PATCH: /room: @Query('room'): [${room}] @Body(): [${body}]${C.END}`);
			const	responseGameRoom = await this.gameService.patchGameRoom(room, body);
			return (responseGameRoom);
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
}
