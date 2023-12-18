import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateGameDto, UpdateGameDto } from './dto/create-game.dto';
import { Repository } from 'typeorm';
import { Game } from './entities/game.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class GameService {
	constructor(
		@InjectRepository(Game)
		private readonly	gameRepository: Repository<Game>, // Bunlarin sirasi cok onemli
		// private readonly	userRepository: Repository<User>, // Bunlarin sirasi cok onemli
		// private readonly	entityManager: EntityManager, // Burasi Repository<Game>'den once olmamali.
	) {}

	async	createGameRoom(createGameDto: CreateGameDto) {
		const	tmpGameRoom = await this.findGameRoom(createGameDto.name);
		if (tmpGameRoom)
			return (`GameRoom: '${createGameDto.name}' already created.`);
		const	newGame = new Game(createGameDto);
		// const	response = await this.entityManager.save(newGame);
		const	response = await this.gameRepository.save(newGame);
		console.log(`New GameRoom created: #${newGame.name}:[${newGame.id}]`);
		return (`New GameRoom created: #${newGame.name}:[${newGame.id}]`);
	}

	async	findGameRoom(
		room: string | undefined,
		relations?: string[] | 'all' | null
	){
		// console.log(`GameService: findGameRoom(): relations(${typeof(relations)}): [${relations}]`);
		const relationObject = (relations === 'all')
		? {players: true, admins: true, watchers: true} // relations all ise hepsini ata.
		: (Array.isArray(relations) // eger relations[] yani array ise hangi array'ler tanimlanmis onu ata.
			? relations.reduce((obj, relation) => ({ ...obj, [relation]: true }), {}) // burada atama gerceklesiyor.
			: (typeof(relations) === 'string' // relations array degilse sadece 1 tane string ise,
				? { [relations]: true } // sadece bunu ata.
				: null)); // hicbiri degilse null ata.
		// console.log(`GameService: findGameRoom(): relationsObject(${typeof(relationObject)}):`, relationObject);
		const tmpChannel = (room === undefined)
			? await this.gameRepository.find({relations: relationObject})
			: await this.gameRepository.findOne({
					where: {name: room},
					relations: relationObject
				});
		// if (!tmpChannel)
		// 	throw (new NotFoundException("game.service.ts: findGameRoom(): GameRoom not found!"));
		return (tmpChannel);
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
			return (`GameRoom '${room}' not found.`);
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
