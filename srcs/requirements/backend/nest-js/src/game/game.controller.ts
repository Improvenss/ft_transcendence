import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Req, UseGuards, NotFoundException } from '@nestjs/common';
import { GameService } from './game.service';
import { CreateGameDto } from './dto/create-game.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { Colors as C } from '../colors';
import { UsersService } from 'src/users/users.service';

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
			console.log("user veirsi", user);
			console.log(`${C.B_GREEN}GET: Room: [${room}], Relation: [${relations}]${C.END}`);
			const	tmpGameRoom = await this.gameService.findGameRoom(room, relations);
			console.log("tmpGameRoom:", tmpGameRoom);
		}
		catch (err)
		{
			console.log("@Get('/room'): ", err);
			return (null)
		}
	}

	@Post('/room/create')
	async	createGameRoom(
		@Req() {user},
		@Body() body: {
			roomName: string,
			description: string,
			creator: string,
		},
		// @Req() {body}: {body: {creator: string, roomName: string}},
		// @Req() { user, body }: { user: any; body: { creator: string; roomName: string } },
	){
		console.log(`${C.B_YELLOW}POST: /room/create: @Body: [${body}]${C.END}`);
		const tmpUser = await this.usersService.findOne(null, user.login);
		if (!tmpUser) {
			throw new NotFoundException(`User not found for GameRoom create: ${user.login}`);
		}
		const	createGameDto: CreateGameDto = {
			name: body.roomName,
			players: [tmpUser],
			admins: [tmpUser],
			watchers: [tmpUser],
		}
		console.log("createGameDto:", createGameDto);
		const	newGameRoom = await this.gameService.createChannel(createGameDto);
		console.log(newGameRoom);
	}
}
