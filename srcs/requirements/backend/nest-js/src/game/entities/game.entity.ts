import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { IsEnum, IsInt, IsNumber, IsString, Max, Min, min } from 'class-validator';
import { GameMode } from '../dto/create-game.dto';

@Entity('game')
export class Game {
	constructor(game: Partial<Game>) {
		Object.assign(this, game);
	}

	@IsNumber()
	@PrimaryGeneratedColumn()
	public id: number;

	@IsString()
	@Column({ length: 15, unique: true , nullable: false })
	public name: string; // ok

	@IsString()
	@Column({ length: 20, nullable: true })
	public password: string;

	@Column({ type: 'enum', enum: ['public', 'private']})
	public type: string;

	@IsEnum(GameMode, { message: 'Invalid game mode' })
	@Column({ type: 'enum', enum: ['classic', 'teamBattle'], nullable: false })
	public mode: string;

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

	@IsString()
	@Column({ length: 30, nullable: true })
	public description: string;

	//----------------------Game Details----------------------------//

	@IsString()
	@Column({ nullable: true })
	public ballLocation: string;

	@IsNumber()
	@Column({ default: 10})
	public ballSpeed: number;

	@IsString()
	@Column({ nullable: true })
	public playerLeftLocation: string;

	@IsString()
	@Column({ nullable: true })
	public playerRightLocation: string;

	@IsInt()
	@IsNumber()
	@Min(0, { message: 'Player score must be at least 0' })
	@Column({ default: 0 })
	public playerLeftScore: number;

	@IsInt()
	@IsNumber()
	@Min(0, { message: 'Player score must be at least 0' })
	@Column({ default: 0 })
	public playerRightScore: number;

	//----------------------User----------------------------//

	@ManyToMany(() => User, user => user.gameRooms, {nullable: true, onDelete: 'CASCADE'})
	public players: User[];

	@ManyToMany(() => User, user => user.gameRoomsAdmin, {nullable: true, onDelete: 'CASCADE'})
	public admins: User[];

	@ManyToMany(() => User, user => user.gameRoomsWatcher, {nullable: true, onDelete: 'CASCADE'})
	public watchers: User[];
}
