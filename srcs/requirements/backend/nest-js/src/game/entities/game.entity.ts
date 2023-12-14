import { Entity,
	PrimaryGeneratedColumn,
	Column,
	ManyToMany } from 'typeorm';
import { User } from 'src/users/entities/user.entity';

@Entity('game')
export class Game {
	constructor(game: Partial<Game>) {
		Object.assign(this, game);
	}

	@PrimaryGeneratedColumn()
	public id: number;

	@Column({ length: 15, unique: true , nullable: false})
	public name: string;

	@Column({ length: 30, nullable: true})
	public description: string;

	@Column({ nullable: true })
	public ballLocation: string;

	@Column({ nullable: true })
	public playerLeftLocation: string;

	@Column({ nullable: true })
	public playerRightLocation: string;

	@Column({ default: 0 })
	public playerLeftScore: number;

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