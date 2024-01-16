import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, ManyToOne, OneToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { IsBoolean, IsEnum, IsInt, IsNumber, IsString, Max, Min, min } from 'class-validator';
import { EGameMode } from '../dto/create-game.dto';

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
	@Column({ length: 100, nullable: true })
	public password: string;

	@IsString()
	@Column({ length: 30, nullable: true })
	public description: string;

	@Column({ type: 'enum', enum: ['public', 'private']})
	public type: string;

	// @IsEnum(GameMode, { message: 'Invalid game mode' })
	// @Column({ type: 'enum', enum: ['classic', 'fast-mode'], nullable: false })
	@IsEnum(EGameMode, { message: 'Invalid Game mode' })
	@Column({ type: 'enum', enum: EGameMode, nullable: false, default: EGameMode.classic })
	// public mode: EGameMode;
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

	@IsBoolean()
	@Column({ nullable: true, default: false })
	public isGameStarted: boolean;

	//----------------------Game Details----------------------------//

	@IsNumber()
	@Column({ nullable: true, default: 500 })
	public ballLocationX: number;

	@IsNumber()
	@Column({ nullable: true, default: 400 })
	public ballLocationY: number;

	@IsNumber()
	@Column({ nullable: true, default: 3 })
	public ballSpeedX: number;

	@IsNumber()
	@Column({ nullable: true, default: 4 })
	public ballSpeedY: number;

	@IsNumber()
	@Column({ nullable: true, default: 340 })
	public pLeftLocation: number;

	@IsNumber()
	@Column({ nullable: true, default: 340 })
	public pRightLocation: number;

	// @IsNumber()
	// @Column({ nullable: true, default: 4 })
	// public pSpeed: number;

	@IsInt()
	@IsNumber()
	@Min(0, { message: 'Player score must be at least 0' })
	@Column({ default: 0 })
	public pLeftScore: number;

	@IsInt()
	@IsNumber()
	@Min(0, { message: 'Player score must be at least 0' })
	@Column({ default: 0 })
	public pRightScore: number;

	//----------------------User----------------------------//

	@Column({ nullable: true, default: false })
	public pRightIsReady: boolean;

	@Column({ nullable: true, default: 0 })
	public pLeftId: number;

	@Column({ nullable: true, default: 0 })
	public pRightId: number;

	@Column({ nullable: true, default: 0 })
	public adminId: number;

	@OneToMany(() => User, (user) => user.currentRoom, {
		nullable: true,
		cascade: true,
		onDelete: 'CASCADE'
	})
	public players: User[];
}
