import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
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
	user?: {
		id?: number,
		login?: string,
		socketId?: string,
	};
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
				user: null,
				score: 0,
				location: 400,
				speed: 0,
				ready: true
			};
			if (this.players && this.players[0]){
				this.playerL.user = {
					id: this.players[0].id,
					login: this.players[0].login,
					socketId: this.players[0].socketId,
				}
			}
		}
		if (!this.playerR){
			this.playerR = {
				user: null,
				score: 0,
				location: 400,
				speed: 0,
				ready: false
			};
			if (this.players && this.players[1]){
				this.playerL.user = {
					id: this.players[1].id,
					login: this.players[1].login,
					socketId: this.players[1].socketId,
				}
			}
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
	public running: boolean;

	@IsString()
	@Column({ nullable: true })
	public invitedPlayer: string;

	@Column('jsonb', { nullable: true })
	public ball: Ball;

	//----------------------User----------------------------//

	@Column('jsonb', { nullable: true })
	public	playerL: Player;

	@Column('jsonb', { nullable: true })
	public	playerR: Player;

	@OneToMany(() => User, (user) => user.currentRoom, {
		nullable: true,
		cascade: true,
		onDelete: 'CASCADE'
	})
	public players: User[];

}