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

	@Column({ length: 20, unique: true , nullable: false})
	@IsNotEmpty()
	public name: string;

	@Column({ nullable: false})
	public description: string; // Kanal tanımı

	@Column({ type: 'enum', enum: ['public', 'private', 'direct_message']})
	public type: string; // Kanal tipi: public, private, direct_message

	@Column({ nullable: true }) // Şifre, private kanallar için
	public password: string;

	@Column({ nullable: true })
	public image: string; // Resmin URL'si veya dosya yolu

	//----------------------User----------------------------//

	@ManyToMany(() => User, user => user.channels, {nullable: true, onDelete: 'CASCADE'})
	// @JoinTable()
	public members: User[]; // Kanalın üyeleri

	@ManyToMany(() => User, user => user.adminChannels, {onDelete: 'CASCADE'})
	// @JoinTable()
	public admins: User[]; // Kanalın yöneticileri

	//----------------------Message----------------------------//

	@OneToMany(() => Message, message => message.channel, { nullable: true, cascade: true, onDelete: 'CASCADE' })
	// @OneToMany(() => Message, message => message.channel, {nullable: true, cascade: true})
	// @OneToMany(() => Message, message => message.channel, {nullable: true, onDelete: 'CASCADE'})
	// @JoinColumn()
	public messages: Message[]; // Kanalın mesajları

	constructor(channel: Partial<Channel>) {
		Object.assign(this, channel);
	}
}

@Entity('message')
export class Message {
	@PrimaryGeneratedColumn()
	public id: number;

	@Column({type: 'varchar', length: 2048})
	public message: string; // Mesaj içeriği

	@Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
	public sentAt: Date; // Mesajın gönderildiği tarih

	@ManyToOne(() => User, { eager: true })
	// @ManyToOne(() => User, user => user.messages)
	// @JoinColumn({ name: 'userId' })
	public author: User; // Mesajın yazarı

	// @ManyToOne(() => Channel, { eager: true })
	@ManyToOne(() => Channel, channel => channel.messages)
	// @JoinColumn({ name: 'channelId' })
	public channel: Channel; // Mesajın gönderildiği kanal

	constructor(message: Partial<Message>) {
		Object.assign(this, message);
	}
}
