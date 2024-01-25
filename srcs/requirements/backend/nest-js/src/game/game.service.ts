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

class Queue<T> {
	private items: T[];

	constructor() {
		this.items = [];
	}

	enqueue(element: T) {
		this.items.push(element);
	}

	dequeue(): T | undefined {
		return this.items.shift();
	}

	isEmpty(): boolean {
		return this.items.length === 0;
	}

	size(): number {
		return this.items.length;
	}

	display() {
		console.log(this.items);
	}
}

class Vector<T> {
	private items: T[];

	constructor() {
		this.items = [];
	}

	// Vektöre öğe ekleme
	push(element: T) {
		this.items.push(element);
	}

	// Belirtilen indeksteki öğeyi döndürme
	get(index: number): T | undefined {
		return this.items[index];
	}

	// Vektörün uzunluğunu döndürme
	size(): number {
		return this.items.length;
	}

	// Vektördeki öğeleri dizi olarak döndürme
	toArray(): T[] {
		return this.items.slice(); // Klon oluşturarak asıl diziyi koruyoruz
	}

	// Vektördeki öğeleri gösterme
	display() {
		console.log(this.items);
	}
}

@Injectable()
export class GameService {
	constructor(
		@InjectRepository(Game)
		private readonly	gameRepository: Repository<Game>,
		private readonly	usersService: UsersService,
	) {}

	private waitingPlayers: { user: User, roomName: string }[] = [];
	// private	waitingPlayers: Queue<number>;
	// private	waitingPlayers: Vector<number>;
	// private	waitingPlayers: number[] = [];

	async	generateUniqueRoomName(length: number, login: string): Promise<string> {
		if (length > 5)
			length = 5;
		if (login.length > 8)
			login = login.substring(0, 9);
		const	randomNumber = Math.random().toString(36).substring(2, length + 2);
		const	roomName = login + '-' + randomNumber;
		return (roomName);
	}

	async	addQueueMatchPlayer(
		{ user }:
			{ user: User }
	){
		const	roomName = await this.generateUniqueRoomName(5, user.login);
		console.log("roomName:", roomName);
		this.waitingPlayers.push({ user: user, roomName: roomName });
		console.log(`Added to wait list [${this.waitingPlayers.length}]`);
		return (null);
	}

	async	matchPlayer(
		{ user }:
			{ user: User }
	){
		console.log(`Wait List [${this.waitingPlayers.length}]`);
		console.log("Siraya girecek user: ", user.login);
		if (this.waitingPlayers.length > 0
			&& this.waitingPlayers[0])
		{
			const index = this.waitingPlayers.findIndex((item) => item.user.id === user.id);
			if (index !== -1)
			{
				const	removedUser = this.waitingPlayers.splice(index, 1);
				if (!removedUser)
					throw (new NotFoundException(`User can't remove matchmaking data`));
				this.addQueueMatchPlayer({ user: user });
				return (null);
			}
			const	createGameDto: CreateGameDto = {
				name: this.waitingPlayers[0].roomName,
				password: null,
				mode: EGameMode.CLASSIC,
				winScore: 11,
				duration: 180,
				description: 'Fast Matching Game',
				// invitedPlayer: null,
				type: 'public',
			}
			const	responseCreateRoom = await this.createGameRoom(
				this.waitingPlayers[0].user.login,
				createGameDto
			);
			console.log("olusturulan oyun hizli oyun" ,responseCreateRoom);
			const	responseAddPlayer = await this.addGameRoomUser(user, {
				room: this.waitingPlayers[0].roomName,
				password: null,
			});
			// this.waitingPlayers.pop();
			this.waitingPlayers.splice(0, 1); // this.waitingPlayers[0]'incisini siliyoruz.
			return (responseAddPlayer);
		}
		else
		{
			this.addQueueMatchPlayer({ user: user });
			return (null);
		}
	}

	async	removeMatchPlayer(
		{ user }:
			{ user: User }
	){
		console.log(`Wait List ama remove olan [${this.waitingPlayers.length}]`);
		console.log("Siradan cikarilacak user: ", user.login);
		// if (!(this.waitingPlayers.length > 0)) // buraya bak ustam
		// 	return ;
		const index = this.waitingPlayers.findIndex((item) => item.user.id === user.id);
		if (index === -1)
			throw (new NotFoundException(`User not found for matchmaking data`));
		const	removedUser = this.waitingPlayers.splice(index, 1);
		if (!removedUser)
			throw (new NotFoundException(`User can't remove matchmaking data`));
		console.log(`Deleted to wait list [${this.waitingPlayers.length}]`);
		return (null);
	}

	async	transferPlayer(
		{user}
		: { user: User }
	){
		const	userGameRoom = await this.usersService.getUserGameRelationDetails(
			user.id,
			await this.getRelationNames(true)
		);
		if (!userGameRoom)
			return ;
		if (userGameRoom.players[0] && userGameRoom.players[1])
		{ // odada 2 kisi varsa
			if (userGameRoom.playerL.user.id === user.id) // cikan kisi soldaysa; sagdaki sola gececek
			{
				userGameRoom.playerL.user = userGameRoom.playerR.user; // sagdan sola gececek.
				userGameRoom.playerR.user = null; // kendi yerini bosaltacak.
			}
			else if (userGameRoom.playerR.user.id === user.id) // cikan kisi sagdaysa; sadece cikacak
				userGameRoom.playerR.user = null;
			userGameRoom.playerR.ready = false;
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
		await this.transferPlayer({ user: tmpUser });
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
	// if (createGameDto.mode === EGameMode.FAST_MODE)
	// {
	// 	console.log("odanin tipi fast mode olmasi lazim yani 1", createGameDto.mode);
	// 	// createGameDto.
	// }
		createGameDto.players = [tmpUser];
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
	){
		if (!user)
			throw (new NotFoundException("'User' not found for register Game Room!"));
		const	tmpRoom = await this.findGameRoom(body.room, ['players']);
		const singleRoom = Array.isArray(tmpRoom) ? tmpRoom[0] : tmpRoom;
		if (!singleRoom)
			throw (new NotFoundException(`${body.room} not found for register Game Room!`));
		if (singleRoom.invitedPlayer != user.login && singleRoom.password && !bcrypt.compareSync(body.password, singleRoom.password))
			throw (new Error("Password is WRONG!!!"));
		if (singleRoom.players.length >= 2)
			throw (new Error("Game Room is full!"));
		await this.transferPlayer({ user: user }); // old - new game room
		if (singleRoom.players.some((players) => players.id === user.id))
			throw (new Error(`Player already exist in ${body.room}`), {status: 3});
		singleRoom.players.push(user);
		singleRoom.playerR.user = {id: user.id, login: user.login, socketId: user.socketId};
		return (await this.gameRepository.save(singleRoom));
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
		{ room, user, }: {
			room: string,
			user: User,
		}
	){
		const	gameLobby = await this.getGamePrimary({ name: room });
		if (!gameLobby)
			throw (new NotFoundException(`Game Lobby not found: ${room}`));
		const	gameLobbyAfterTransfer = await this.transferPlayer({ user: user });
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