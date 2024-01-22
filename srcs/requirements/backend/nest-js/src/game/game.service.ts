import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateGameDto, EGameMode, ILiveData, UpdateGameDto } from './dto/create-game.dto';
import { Repository } from 'typeorm';
import { Game } from './entities/game.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { FindOptionsRelations } from 'typeorm';
import { Socket } from 'socket.io';

@Injectable()
export class GameService {
	constructor(
		@InjectRepository(Game)
		private readonly	gameRepository: Repository<Game>,
		private readonly	usersService: UsersService,
	) {}

	restartBall(
		gameRoomData: Game
	)
	{
		const newPos = Math.floor(Math.random() * 2);
		const moves = [
			{ x: -4, y: -2 },
			{ x: -3, y: -4 },
			{ x: -3, y: 3 },
			{ x: -3, y: 2 },
			{ x: 4, y: -2 },
			{ x: 2, y: -4 },
		];
		const initialMove = moves[Math.floor(Math.random() * moves.length)];
		gameRoomData.ballSpeedX = initialMove.x;
		gameRoomData.ballSpeedY = initialMove.y;
		gameRoomData.ballLocationX = 479;
		if (newPos == 0)
			gameRoomData.ballLocationY = 22;
		else
			gameRoomData.ballLocationY = 757;
	}

	async	calcGameLoop(
		// { gameRoomData, }
		// : { gameRoomData: Game }
		gameRoomData: Game
	){
		if (!gameRoomData)
			return ;

		if (gameRoomData.duration <= 0)
		{
			if (gameRoomData.pLeftScore > gameRoomData.pRightScore)
				return ({ winner: gameRoomData.pLeftId });
			else if (gameRoomData.pLeftScore < gameRoomData.pRightScore)
				return ({ winner: gameRoomData.pRightId });
			else
				return ({ winner: gameRoomData.pLeftId, isTie: true });
		}

		// top hareketi
		if (gameRoomData.ballLocationY + 42 >= 800
			|| gameRoomData.ballLocationY <= 0)
			gameRoomData.ballSpeedY *= -1;
	
		if (gameRoomData.ballLocationY + 21 >= gameRoomData.pLeftLocation
			&& gameRoomData.ballLocationY + 21 <= gameRoomData.pLeftLocation + 120)
		{ //Left Player Collision
			if (gameRoomData.ballLocationX <= 10)
				{
					gameRoomData.ballSpeedX *= -1;
					gameRoomData.ballSpeedY += gameRoomData.pLeftSpeed / 10;
					gameRoomData.ballLocationX += 3;
				}
		}
		else if (gameRoomData.ballLocationY + 21 >= gameRoomData.pRightLocation
			&& gameRoomData.ballLocationY + 21 <= gameRoomData.pRightLocation + 120)
		{ //Right Player Collision
			if (gameRoomData.ballLocationX + 42 >= 990)
			{
				gameRoomData.ballSpeedX *= -1;
				gameRoomData.ballSpeedY += gameRoomData.pRightSpeed / 10;
				gameRoomData.ballLocationX -= 3;
			}
		}

		//add score to left
		if (gameRoomData.ballLocationX + 42 >= 1000)
		{
			gameRoomData.pLeftScore += 1;
			if (gameRoomData.pLeftScore >= gameRoomData.winScore)
				return ({ winner: gameRoomData.pLeftId });
			this.restartBall(gameRoomData);
		}
		//add score to right
		else if (gameRoomData.ballLocationX <= 0)
		{
			gameRoomData.pRightScore += 1;
			if (gameRoomData.pRightScore >= gameRoomData.winScore)
				return ({ winner: gameRoomData.pRightId });
			this.restartBall(gameRoomData);
		}

		gameRoomData.ballLocationX += gameRoomData.ballSpeedX;
		gameRoomData.ballLocationY += gameRoomData.ballSpeedY;
		
		// sol oyuncu hareketi
		if (gameRoomData.pLeftLocation + gameRoomData.pLeftSpeed <= 0)
			gameRoomData.pLeftLocation = 0;
		else if (gameRoomData.pLeftLocation + gameRoomData.pLeftSpeed + 120 >= 800)
			gameRoomData.pLeftLocation = 800 - 120;
		else
			gameRoomData.pLeftLocation += gameRoomData.pLeftSpeed;

		// sag oyuncu hareketi
		if (gameRoomData.pRightLocation + gameRoomData.pRightSpeed <= 0)
			gameRoomData.pRightLocation = 0;
		else if (gameRoomData.pRightLocation + gameRoomData.pRightSpeed + 120>= 800)
			gameRoomData.pRightLocation = 800 - 120;
		else
			gameRoomData.pRightLocation += gameRoomData.pRightSpeed;

		const	returnData: ILiveData = {
			ballLocationX: gameRoomData.ballLocationX,
			ballLocationY: gameRoomData.ballLocationY,
			pLeftLocation: gameRoomData.pLeftLocation,
			pRightLocation: gameRoomData.pRightLocation,
			pLeftScore: gameRoomData.pLeftScore,
			pRightScore: gameRoomData.pRightScore,
			duration: gameRoomData.duration,
		};
		return (returnData);
	}

	async	finishGameRoom(
		{ socket, gameData, isTie }
		: { socket: Socket, gameData: Game, isTie: boolean }
	){
		if (!gameData)
			return ;
		console.log(`Oyun Bitti! Room -> (${gameData.name})`);
		if (isTie)
			return ({ winner: 0, isTie: true });
		if (socket.id === gameData.pLeftSocketId)
			return ({ winner: gameData.pRightId });
		else
			return ({ winner: gameData.pLeftId });
	}

	async	transferPlayer(
		{user, socket }
		: { user: User, socket: Socket }
	){
		const	userGameRoom = await this.usersService.getUserGameRelationDetails(
			user.id,
			await this.getRelationNames(true)
		);
		if (!userGameRoom)
			return ;
		if (userGameRoom.players[0] && userGameRoom.players[1])
		{ // odada 2 kisi varsa
			if (userGameRoom.pLeftId === user.id) // cikan kisi soldaysa; sagdaki sola gececek
			{
				userGameRoom.pLeftId = userGameRoom.pRightId; // sagdan sola gececek.
				userGameRoom.adminId = userGameRoom.pRightId; // adminligi devredecek
				userGameRoom.pRightId = null; // kendi yerini bosaltacak.
				// userGameRoom.pLeftSocketId = socket.id; // socket.id'sini de set etmeden olmaz :D
				// userGameRoom.pRightSocketId = null;
			}
			else if (userGameRoom.pRightId === user.id) // cikan kisi sagdaysa; sadece cikacak
			{
				userGameRoom.pRightId = null;
				userGameRoom.pRightIsReady = false;
				userGameRoom.pRightSocketId = null;
			}
			userGameRoom.players = userGameRoom.players.filter(player => player.id !== user.id); // bu transfer edilen user'i de players[]'den kaldiriyoruz.
			return (await this.gameRepository.save(userGameRoom)); // eski guncellenmis odayi kaydet.
		}
		else if (userGameRoom.players.length <= 1)
		{ // odada 1 kisi var kanal silinecek.
			return (await this.deleteGameRoom(userGameRoom.name));
		}
	}

	async	createGameRoom(
		login: string,
		createGameDto: CreateGameDto,
		socket?: Socket,
	){
		const	tmpUser = await this.usersService.getUserPrimary({login: login});
		const	tmpGameRoom = await this.findGameRoom(createGameDto.name);
		const	singleRoom = Array.isArray(tmpGameRoom) ? tmpGameRoom[0] : tmpGameRoom;
		if (singleRoom)
			return (`GameRoom: '${createGameDto.name}' already created.`);
		Object.assign(createGameDto, {
			password: (createGameDto.password === (undefined || null))
			? null
			: bcrypt.hashSync(
				createGameDto.password,
				bcrypt.genSaltSync(+process.env.DB_PASSWORD_SALT)),
		})
		await this.transferPlayer({user: tmpUser, socket: socket});
	// eski oyun odasi
//  ----------------------
//  POST: /room: @Body():  {
// 	  name: 'b',
// 	  password: null,
// 	  mode: 'fast-mode',
// 	  winScore: 10,
// 	  duration: 40,
// 	  description: 'modlu',
// 	  type: 'public'
// 	}
	// olusturulan yeni oyun odasi
	if (createGameDto.mode === EGameMode.fastMode)
	{
		console.log("odanin tipi fast mode olmasi lazim yani 1", createGameDto.mode);
		// createGameDto.
	}
		createGameDto.players = [tmpUser];
		createGameDto.pLeftId = tmpUser.id;
		createGameDto.pLeftSocketId = tmpUser.socketId;
		createGameDto.pRightId = null;
		createGameDto.adminId = tmpUser.id;
		Object.assign(createGameDto)
		const	newRoom = new Game(createGameDto);
		const	response = await this.gameRepository.save(newRoom);
		console.log(`New GameRoom created ✅: #${newRoom.name}:[${newRoom.id}]`);
		return (`New GameRoom created ✅: #${newRoom.name}:[${newRoom.id}]`);
	}

	async isRoomUser(room: Game, user: User) {
		if (!room || !user)
			throw (new NotFoundException(`game.service.ts: findRoomUser: room: ${room.name} || user: ${user.login} not found!`));
		const foundUser = room.players.find((roomUser) => roomUser.login === user.login);
		if (!foundUser)
			return (false);
		return (true);
	}

	async getRelationNames(prefix: boolean = false): Promise<string[]> {
		const pre = prefix ? 'currentRoom.' : '';
		const metadata = this.gameRepository.metadata;
		const relationNames = metadata.relations.map((relation) => (pre + relation.propertyName));
		if (prefix)
			relationNames.push('currentRoom');
		return relationNames;
	}

	async getGamePrimary({id, name}:{id?: number, name?: string}){
		const inputSize = [id, name].filter(Boolean).length;
		if (inputSize !== 1){
			throw new Error('Provide exactly one of id or name.');
		}

		const whereClause: Record<string, any> = {
			id: id,
			name: name,
		};
		return (await this.gameRepository.findOne({where: whereClause}));
	}

	async getGameRelation(
		{id, name, relation, primary}: {
			id?: number,
			name?: string,
			relation: FindOptionsRelations<Game>,
			primary: boolean,
		}
	){
		const inputSize = [id, name].filter(Boolean).length;
		if (inputSize !== 1){
			throw new Error('Provide exactly one of id or name.');
		}
		const whereClause: Record<string, any> = {
			id: id,
			name: name,
		};
		if (Object.keys(relation).length === 0){
			const allChannelRelation = await this.getRelationNames();
			relation = allChannelRelation.reduce((acc, rel) => {
				acc[rel] = true;
				return acc;
			}, {} as FindOptionsRelations<Game>);
		}
		const data = await this.gameRepository.findOne({where: whereClause, relations: relation});
		if (!data)
			return (null);
		if (primary === true){ // default + relation
			return (data);
		}
		const result: Partial<Game> = {};
		// Sadece ilişkileri döndür
		Object.keys(relation).forEach((rel) => {
			result[rel] = data[rel];
		});
		return result as Game;
	}

	async	findGameRoomWId(
		id: number,
		relations?: string[] | 'all' | undefined,
	){
		const relationObject = (relations === 'all')
		? {players: true}
		: (Array.isArray(relations)
			? relations.reduce((obj, relation) => ({ ...obj, [relation]: true }), {})
			: (typeof(relations) === 'string'
				? { [relations]: true }
				: null));
		console.log(`GameService: findGameRoomWId(): ${id} relationsObject(${typeof(relationObject)}):`, relationObject);
		const tmpRoom = (id === undefined)
			? await this.gameRepository.find({relations: relationObject})
			: await this.gameRepository.findOne({
					where: {id: id},
					relations: relationObject
				});
		return (tmpRoom);
	}

	async	findGameRoom(
		room: string | undefined,
		relations?: string[] | 'all' | undefined
	){
		const relationObject = (relations === 'all')
		? {players: true}
		: (Array.isArray(relations)
			? relations.reduce((obj, relation) => ({ ...obj, [relation]: true }), {})
			: (typeof(relations) === 'string'
				? { [relations]: true }
				: null));
		// console.log(`GameService: findGameRoom(): relationsObject(${typeof(relationObject)}):`, relationObject);
		const tmpRoom = (room === undefined)
			? await this.gameRepository.find({relations: relationObject})
			: await this.gameRepository.findOne({
					where: {name: room},
					relations: relationObject
				});
		return (tmpRoom);
	}

	async addGameRoomUser(
		user: User,
		body: { room: string, password: string },
		socket: Socket,
	){
		if (!user)
			throw (new NotFoundException("'User' not found for register Game Room!"));
		const	tmpRoom = await this.findGameRoom(body.room, ['players']);
		const singleRoom = Array.isArray(tmpRoom) ? tmpRoom[0] : tmpRoom;
		if (!singleRoom)
			throw (new NotFoundException("'Game Room' not found for register Game Room!"));
		if (await this.isRoomUser(singleRoom, user))
			throw (new Error(`User '${user.login}' already in this room[${singleRoom.name}].`), {
				status: 5 // 5 -> kendim salladim -> eger 5 ise lobby ekranina tekrar baglanabilsin.
			});
		if (singleRoom.password && !bcrypt.compareSync(body.password, singleRoom.password))
			throw (new Error("Password is WRONG!!!"));
		if (singleRoom.players.length >= 2)
			throw (new Error("Game Room is full!"));
		await this.transferPlayer({ user: user, socket: socket}); // old - new game room
		if (singleRoom.players[0] && singleRoom.players[1])
			return ({ msg: `yeni oyun odasi dolu kardes 2 kisi de var.` });
		else if (singleRoom.players.length <= 1)
			if (singleRoom.players[0])
				singleRoom.pRightId = user.id;
		singleRoom.players.push(user);
		return (this.gameRepository.save(singleRoom));
	}

	/**
	 * PATCH genellikle guncellemek icin kullanilir.
	 */
	async	patchGameRoom(
		room: string | undefined,
		body: Partial<UpdateGameDto>,
	){
		const	tmpGameRooms = await this.findGameRoom(room, 'all');
		if (!tmpGameRooms)
			throw (new NotFoundException(`GameRoom '${room}' not found.`));
		if (!Array.isArray(tmpGameRooms))
		{ // Game seklinde gelirse alttaki for()'un kafasi karismasin diye.
			Object.assign(tmpGameRooms, body);
			return (await this.gameRepository.save(tmpGameRooms));
		}
		for (const room of tmpGameRooms)
		{ // Game[] seklinde gelirse hepsini tek tek guncellemek icin.
			Object.assign(room, body);
			await this.gameRepository.save(room);
		}
		return (tmpGameRooms);
	}

	async	leaveGameLobby(
		{ room, user, socket, }: {
			room: string,
			user: User,
			socket?: Socket,
		}
	){
		const	gameLobby = await this.getGamePrimary({ name: room });
		if (!gameLobby)
			throw (new NotFoundException(`Game Lobby not found: ${room}`));
		const	gameLobbyAfterTransfer = await this.transferPlayer({ user: user, socket: socket });
		return (gameLobbyAfterTransfer);
	}

	/**
	 * PUT kaynagin tamamini degistirmek icin kullanilir.
	 */
	// async	putGameRoom()

	async	deleteGameRoom(
		room: string | undefined,
	){
		const	tmpGameRoom = await this.findGameRoom(room);
		if (!tmpGameRoom)
			return (`GameRoom: '${room}' not found.`);
		// await	this.userRepository.delete()
		const	responseGameRoom = await this.gameRepository.remove(tmpGameRoom as Game);
		// const	responseGameRoom = await this.entityManager.delete(room);
		return (responseGameRoom)
	}
}