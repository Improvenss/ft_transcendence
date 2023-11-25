import { Entity,
	Column,
	PrimaryGeneratedColumn,
	ManyToOne,
	ManyToMany,
	JoinColumn,
	OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { IsNotEmpty } from 'class-validator';

@Entity('channel')
export class Channel {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ length: 50, unique: true , nullable: false})
	@IsNotEmpty()
	name: string;

	@Column({ default: true })
	isActive: boolean;

	@OneToMany(() => Message, message => message.channel, {nullable: true})
	@JoinColumn()
	messages: Message[];

	@ManyToMany(() => User, user => user.channels, {nullable: true})
	@JoinColumn()
	users: User[]; // Kanali DB'den silme islemini kanali olusturan ya da admin olan kisi silebilir.

	@ManyToMany(() => User, user => user.channels, {nullable: true})
	@JoinColumn({ name: 'adminId' })
	admins: User[]; // Kanali DB'den silme islemini kanali olusturan ya da admin olan kisi silebilir.

	// @Column("simple-array")
	// adminId: number[];

	// Buradaki password'u ayir cunku ya public/private bunlar da passwordu var/yok olarak olabilir.
	@Column({ type: 'enum', enum: ['public', 'private', 'password'] })
	type: string;

	@Column({ nullable: true })
	password: string;

	constructor(channel: Partial<Channel>) {
		Object.assign(this, channel);
	}
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

	constructor(message: Partial<Message>) {
		Object.assign(this, message);
	}
}