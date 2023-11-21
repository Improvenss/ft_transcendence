// chat.entity.ts

import { Entity,
	Column,
	PrimaryGeneratedColumn,
	ManyToOne,
	ManyToMany,
	JoinColumn,
	OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('channel')
export class Channel {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ length: 50, unique: true })
	name: string;

	@Column({ default: true })
	isActive: boolean;

	@OneToMany(() => Message, message => message.channel)
	messages: Message[];

	@ManyToMany(() => User, user => user.channels)
	@JoinColumn({ name: 'adminId' })
	admin: User[];

	@Column()
	adminId: number;

	// Buradaki password'u ayir cunku ya public/private bunlar da passwordu var/yok olarak olabilir.
	@Column({ type: 'enum', enum: ['public', 'private', 'password'] })
	type: string;

	@Column({ nullable: true })
	password: string;
}

@Entity('message')
export class Message {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	message: string;

	@Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
	sentAt: Date;

	@ManyToOne(() => User, user => user.messages)
	@JoinColumn({ name: 'userId' })
	user: User;

	@ManyToOne(() => Channel, channel => channel.messages)
	@JoinColumn({ name: 'channelId' })
	channel: Channel;
}

