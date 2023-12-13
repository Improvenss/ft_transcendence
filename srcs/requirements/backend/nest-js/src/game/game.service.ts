import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateGameDto } from './dto/create-game.dto';
import { EntityManager, Repository } from 'typeorm';
import { Game } from './entities/game.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class GameService {
	constructor(
		@InjectRepository(Game)
		private readonly	gameRepository: Repository<Game>, // Bunlarin sirasi cok onemli
		private readonly	entityManager: EntityManager, // Burasi Repository<Game>'den once olmamali.
	) {}

	async	createChannel(createGameDto: CreateGameDto) {
		const	newGame = new Game(createGameDto);
		const	response = await this.entityManager.save(newGame);
		console.log("createChannel response:", response);
		return (`New GameRoom created: #${newGame.name}:[${newGame.id}]`);
	}

	async	findGameRoom(
		room: string | undefined,
		relations?: string[] | 'all' | null
	){
		console.log(`GameService: findGameRoom(): relations(${typeof(relations)}): [${relations}]`);
		const relationObject = (relations === 'all')
		? {players: true, admins: true, watchers: true} // relations all ise hepsini ata.
		: (Array.isArray(relations) // eger relations[] yani array ise hangi array'ler tanimlanmis onu ata.
			? relations.reduce((obj, relation) => ({ ...obj, [relation]: true }), {}) // burada atama gerceklesiyor.
			: (typeof(relations) === 'string' // relations array degilse sadece 1 tane string ise,
				? { [relations]: true } // sadece bunu ata.
				: null)); // hicbiri degilse null ata.
		console.log(`GameService: findGameRoom(): relationsObject(${typeof(relationObject)}):`, relationObject);
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
}
