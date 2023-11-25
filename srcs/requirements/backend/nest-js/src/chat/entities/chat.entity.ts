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
	public id: number;

	@Column({ length: 50, unique: true , nullable: false})
	@IsNotEmpty()
	public name: string;

	@Column({ default: true })
	public isActive: boolean;

	@OneToMany(() => Message, message => message.channel, {nullable: true})
	@JoinColumn()
	public messages: Message[];

	@ManyToMany(() => User, user => user.channels, {nullable: true})
	@JoinTable()
	public users: User[];

	@ManyToMany(() => User, user => user.adminChannels)
	public admins: User[];

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

	@Column()
	public message: string;

	@Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
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

















function JoinTable(): (target: Channel, propertyKey: "users") => void {
	throw new Error('Function not implemented.');
}
// @Entity('channel')
// export class Channel {
// 	@PrimaryGeneratedColumn()
// 	public id: number;

// 	@Column({ length: 50, unique: true , nullable: false})
// 	@IsNotEmpty()
// 	public name: string;

// 	@Column({ default: true })
// 	public isActive: boolean;

// 	@OneToMany(() => Message, message => message.channel, {nullable: true})
// 	@JoinColumn()
// 	public messages: Message[];

// 	@ManyToMany(() => User, user => user.channels, {nullable: true})
// 	@JoinColumn()
// 	public users: User[]; // Kanali DB'den silme islemini kanali olusturan ya da admin olan kisi silebilir.

// 	@ManyToMany(() => User, user => user.channels, {nullable: true})
// 	@JoinColumn({ name: 'adminId' })
// 	public admins: User[]; // Kanali DB'den silme islemini kanali olusturan ya da admin olan kisi silebilir.

// 	// @Column("simple-array")
// 	// adminId: number[];

// 	// Buradaki password'u ayir cunku ya public/private bunlar da passwordu var/yok olarak olabilir.
// 	@Column({ type: 'enum', enum: ['public', 'private', 'password'] })
// 	public type: string;

// 	@Column({ nullable: true })
// 	public password: string;

// 	constructor(channel: Partial<Channel>) {
// 		Object.assign(this, channel);
// 	}
// }

// @Entity('message')
// export class Message {
// 	@PrimaryGeneratedColumn()
// 	public id: number;

// 	@Column()
// 	public message: string;

// 	@Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
// 	public sentAt: Date;

// 	@ManyToOne(() => User, user => user.messages)
// 	@JoinColumn({ name: 'userId' })
// 	public user: User;

// 	@ManyToOne(() => Channel, channel => channel.messages)
// 	@JoinColumn({ name: 'channelId' })
// 	public channel: Channel;

// 	constructor(message: Partial<Message>) {
// 		Object.assign(this, message);
// 	}
// }