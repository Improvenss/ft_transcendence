import { Controller, Get, Post, Body, Patch, Delete, Query, Req, UseGuards, NotFoundException, UsePipes, ValidationPipe } from '@nestjs/common';
import { GameService } from './game.service';
import { CreateGameDto } from './dto/create-game.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { Colors as C } from '../colors';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/entities/user.entity';

@UseGuards(AuthGuard)
@Controller('/game')
export class GameController {
	constructor(
		private readonly usersService: UsersService,
		private readonly gameService: GameService,
	) {}

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

	@Post('/room')
	@UsePipes(new ValidationPipe())
	async	createGameRoom(
		@Req() {user},
		// @Body() body: {
		// 	roomName: string,
		// 	description?: string,
		// 	gameMode: string,
		// 	winScore: number,
		// 	duration: number,
		// 	password?: string,
		// },
		@Body() body: CreateGameDto,
		// @Req() {body}: {body: {creator: string, roomName: string}},
		// @Req() { user, body }: { user: any; body: { creator: string; roomName: string } },
	){
		try
		{
			console.log(`${C.B_YELLOW}POST: /room: @Body(): [${body}]${C.END}`);
			const tmpUser = await this.usersService.findUser(user.login);
			if (!tmpUser) {
				return (new NotFoundException(`User not found for GameRoom create: ${user.login}`));
			}
			// const	createGameDto: CreateGameDto = {
			// 	name: body.roomName,
			// 	description: body.description,
			// 	mode: body.gameMode,
			// 	winScore: body.winScore,
			// 	duration: body.duration,
			// 	password: body.password,
			// 	players: [tmpUser as User],
			// 	admins: [tmpUser as User],
			// 	watchers: [],
			// }
			// const	newGameRoom = await this.gameService.createGameRoom(createGameDto);
			console.log("onceki hali", body);
			Object.assign(body, {players: tmpUser, admins: tmpUser})
			console.log("sonraki hali", body);
			const	newGameRoom = await this.gameService.createGameRoom(body);
			return (newGameRoom);
		}
		catch (err)
		{
			console.log("@Post('/room'): ", err);
			return ({err: err});
		}
	}

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
