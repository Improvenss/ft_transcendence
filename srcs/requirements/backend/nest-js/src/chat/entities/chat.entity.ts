import { Entity,
	Column,
	PrimaryGeneratedColumn,
	ManyToOne,
	ManyToMany,
	JoinColumn,
	JoinTable,
	OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { IsNotEmpty } from 'class-validator';

@Entity('channel')
export class Channel {
	@PrimaryGeneratedColumn()
	public id: number;

	@Column({ length: 50, unique: true , nullable: false})
	@IsNotEmpty()
	public name: string;

	@Column({ default: true })
	public isActive: boolean;

	@OneToMany(() => Message, message => message.channel, {nullable: true, onDelete: 'CASCADE'})
	@JoinColumn()
	public messages: Message[];

	@ManyToMany(() => User, user => user.channels, {nullable: true, onDelete: 'CASCADE'})
	// @JoinTable()
	public users: User[];

	// @ManyToMany(() => User, user => user.adminChannels)
	// public admins: User[];

	@Column({ type: 'enum', enum: ['public', 'private', 'password'] })
	public type: string;

	@Column({ nullable: true })
	public password: string;

	constructor(channel: Partial<Channel>) {
		Object.assign(this, channel);
	}
}

@Entity('message')
export class Message {
	@PrimaryGeneratedColumn()
	public id: number;

	@Column({type: 'varchar', length: 1024})
	public message: string;

	@Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
	public sentAt: Date;

	@ManyToOne(() => User, user => user.messages)
	@JoinColumn({ name: 'userId' })
	public user: User;

	@ManyToOne(() => Channel, channel => channel.messages)
	@JoinColumn({ name: 'channelId' })
	public channel: Channel;

	constructor(message: Partial<Message>) {
		Object.assign(this, message);
	}
}