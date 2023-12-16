import { Entity,
	PrimaryGeneratedColumn,
	Column,
	ManyToMany } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { IsInt, IsNumber, IsString } from 'class-validator';

@Entity('game')
export class Game {
	constructor(game: Partial<Game>) {
		Object.assign(this, game);
	}

	@IsNumber()
	@PrimaryGeneratedColumn()
	public id: number;

	@IsString()
	@Column({ length: 15, unique: true , nullable: false})
	public name: string;

	@IsString()
	@Column({ length: 30, nullable: true})
	public description: string;

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
	@Column({ default: 0 })
	public playerLeftScore: number;

	@IsInt()
	@IsNumber()
	@Column({ default: 0 })
	public playerRightScore: number;

	//----------------------User----------------------------//

	@ManyToMany(() => User, user => user.gameRooms, {nullable: true, onDelete: 'CASCADE'})
	public players: User[];

	@ManyToMany(() => User, user => user.gameRoomsAdmin, {onDelete: 'CASCADE'})
	public admins: User[];

	@ManyToMany(() => User, user => user.gameRoomsWatcher, {nullable: true, onDelete: 'CASCADE'})
	public watchers: User[];
}