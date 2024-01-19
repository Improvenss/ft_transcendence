import { IsNumber, Max, Min } from 'class-validator';
import { User } from 'src/users/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';

@Entity('game_history')
export class GameHistory {
	constructor(gameHistory: Partial<GameHistory>) {
		Object.assign(this, gameHistory);
	}

	@IsNumber()
	@PrimaryGeneratedColumn()
	public id: number;

	@ManyToOne(() => User, user => user.gameHistory)
	user: User;

	@Column({ type: 'enum', enum: ['win', 'lose']})
	result: 'win' | 'lose';

	@IsNumber()
	@Min(0, { message: 'Game history score must be at least 0' })
	@Max(999, { message: 'Game history score cannot be greater than 999' })
	@Column({ default: 0, nullable: false })
	public score: number;

	@Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
	public date: Date;
}



// @Entity('game_history')
// export class GameHistory {
// 	constructor(gameHistory: Partial<GameHistory>) {
// 		Object.assign(this, gameHistory);
// 	}

// 	@PrimaryGeneratedColumn()
// 	id: number;

// 	// @ManyToOne(() => Game, game => game.gameHistory)
// 	// game: Game;

// 	@ManyToOne(() => User, user => user.gameHistory)
// 	user: User;

// 	@Column()
// 	result: 'win' | 'lose';

// 	@Column()
// 	score: number;

// 	@Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
// 	date: Date;
// }

