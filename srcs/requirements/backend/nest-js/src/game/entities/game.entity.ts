import { Entity, PrimaryGeneratedColumn, Column, OneToMany, AfterUpdate } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { IsBoolean, IsNumber, IsPositive, IsString, Max, Min } from 'class-validator';
import { EGameMode } from '../dto/create-game.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

export class Ball {
	@IsPositive()
	x?: number;
 
	@IsPositive()
	y?: number;

	@IsPositive()
	speedX?: number;

	@IsPositive()
	speedY?: number;
}

export class Player {
	user?: User;
	score?: number;
	location?: number;
	speed?: number;
	ready?: boolean;
}

@Entity('game')
export class Game {
	@InjectRepository(Game)
	private readonly gameRepository: Repository<Game>;
	constructor(game: Partial<Game>) {
		Object.assign(this, game);
		if (!this.ball){
			this.ball = {
				x: 500,
				y: 400,
				speedX: 3,
				speedY: 4
			};
		}
		if (!this.playerL){
			this.playerL = {
				user: (this.players && this.players[0]) ? this.players[0] : null,
				score: 0,
				location: 400,
				speed: 0,
				ready: true
			};
		}
		if (!this.playerR){
			this.playerR = {
				user: (this.players && this.players[1]) ? this.players[1] : null,
				score: 0,
				location: 400,
				speed: 0,
				ready: false
			};
		}
	}

	@IsNumber()
	@PrimaryGeneratedColumn()
	public id: number;

	//----------------------Game Details----------------------------//

	@IsString()
	@Column({ length: 15, unique: true , nullable: false })
	public name: string; // ok

	@IsString()
	@Column({ length: 100, nullable: true })
	public password: string;

	@IsString()
	@Column({ length: 30, nullable: true })
	public description: string;

	@Column({ type: 'enum', enum: ['public', 'private']})
	public type: string;

	// @IsEnum(EGameMode, { message: 'Invalid Game mode' })
	@Column({ type: 'enum', enum: EGameMode, default: EGameMode.CLASSIC })
	public mode: EGameMode;

	@IsNumber()
	@Min(1, { message: 'Win score must be at least 1' })
	@Max(999, { message: 'Win score cannot be greater than 999' })
	@Column({ default: 5, nullable: false })
	public winScore: number;

	@IsNumber()
	@Min(30, { message: 'Duration must be at least 30' })
	@Max(999, { message: 'Duration cannot be greater than 999' })
	@Column({ default: 30, nullable: false })
	public duration: number;

	@IsBoolean()
	@Column({ nullable: true, default: false })
	public isGameStarted: boolean;

	@Column('jsonb', { nullable: true })
	public ball: Ball;

	//----------------------User----------------------------//

	@OneToMany(() => User, (user) => user.currentRoom, {
		nullable: true,
		cascade: true,
		onDelete: 'CASCADE'
	})
	public players: User[];

	@Column('jsonb', { nullable: true })
	public	playerL: Player;

	@Column('jsonb', { nullable: true })
	public	playerR: Player;

	// players dizisi değiştiğinde otomatik olarak çağrılacak metod
	@AfterUpdate()
	async	updateGamePlayersData(): Promise<void> {
		console.log("GAME ENTITY'SINDE DEGISIKLIK OLDU WAY AWK", this.players);
		// if (this.players.length <= 0)
		// { // odada kimse yok o yuzden Game Room'unu siliyoruz.
		// 	await this.gameRepository.remove(this);
		// }
		if (this.players[0])
			this.playerL.user = this.players[0];

		if (this.players[1])
			this.playerR.user = this.players[1];
		else
			this.playerR.user = null;

		
	}

}