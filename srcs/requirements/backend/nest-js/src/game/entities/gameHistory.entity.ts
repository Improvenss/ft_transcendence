// import { IsNumber } from 'class-validator';
// import { User } from 'src/users/entities/user.entity';
// import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';

// export enum GameStatus {
// 	WIN = 'win',
// 	LOSE = 'lose',
// 	TIE = 'tie',
// }

// @Entity('gameHistory')
// export class GameHistory {
// 	constructor(gameHistory: Partial<GameHistory>) {
// 		Object.assign(this, gameHistory);
// 	}

// 	@IsNumber()
// 	@PrimaryGeneratedColumn()
// 	public id: number;

// 	@ManyToOne(() => User, user => user.gameHistory)
// 	public user: User;

// 	@Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
// 	public date: Date;

// 	@Column()
// 	public name: string;
	
// 	@Column()
// 	public rival: string;

// 	@Column({ type: 'enum', enum: GameStatus})
// 	public result: GameStatus;

// 	//@IsNumber()
// 	//@Min(0, { message: 'Game history score must be at least 0' })
// 	//@Max(999, { message: 'Game history score cannot be greater than 999' })
// 	//@Column({ default: 0, nullable: false })
// 	//public score: number;
// }
