import { Column, Entity, PrimaryGeneratedColumn, ManyToMany, OneToMany, JoinTable, ManyToOne } from "typeorm";
import { Channel, Message } from "src/chat/entities/chat.entity";
import { Game } from "src/game/entities/game.entity";
import { IsEmail } from "class-validator";

// Public olarak belirtilmese dahi public olarak ele alınmaktadır.
// @Entity({name: 'user'})
@Entity('user')
export class User {
	@PrimaryGeneratedColumn()
	public id: number; // Database'deki sıralama için değişken

	//----------------------Mandatory----------------------------//

	// @Column({type: "text", nullable: true})
	@Column({ unique: true })
	@IsEmail()
	public email: string; // Intra email

	@Column({ unique: true })
	public login: string; // Intra login

	@Column()
	public displayname: string; // Intra ad-soyad

	@Column()
	public imageUrl: string; // Intra resim linki

	@Column({ nullable: true })
	public socketId: string; // Websocket

	//----------------------Status----------------------------//

	@Column({ default: 'offline' }) // Default olarak offline olarak tanımlandı
	public status: 'online' | 'offline' | 'in-chat' | 'in-game' | 'afk'

	//----------------------Optional----------------------------//

	@Column({ nullable: true })
	public nickname: string; // Kullanıcı tarafından eklenen ekstra isim

	@Column({ nullable: true })
	public avatar: string; // Kullanıcı tarafından eklenen ekstra resim

	//----------------------Friends----------------------------//

	@ManyToMany(() => User, user => user.friends)
	@JoinTable()
	public friends: User[];

	//----------------------Notfis----------------------------//

	@OneToMany(() => Notifs, notification => notification.user)
	public notifications: Notifs[];

	//----------------------Channel----------------------------//

	// @ManyToMany(() => Channel, channel => channel.members)
	@ManyToMany(() => Channel, channel => channel.members, {cascade: true})
	@JoinTable()
	public channels: Channel[]; // Kullanıcının üye olduğu kanallar

	@ManyToMany(() => Channel, channel => channel.admins)
	@JoinTable()
	public adminChannels: Channel[]; // Kullanıcının yönetici olduğu kanallar

	@ManyToMany(() => Channel, channel => channel.bannedUsers)
	@JoinTable()
	public bannedChannels: Channel[];

	//----------------------Message----------------------------//

	@OneToMany(() => Message, message => message.author, {nullable: true})
	@JoinTable()
	public messages: Message[]; // Kullanıcının gönderdiği ve aldığı mesajlar

	//----------------------Game-------------------------------//

	@Column({ default: 0 })
	public gamesWon: number;

	@Column({ default: 0 })
	public gamesLost: number;

	// game achievementler

	@ManyToMany(() => Game, game => game.players, { nullable: true, onDelete: 'CASCADE' })
	@JoinTable()
	public gameRooms: Game[];

	@ManyToMany(() => Game, game => game.admins, { nullable: true, onDelete: 'CASCADE' })
	@JoinTable()
	public gameRoomsAdmin: Game[];

	@ManyToMany(() => Game, game => game.watchers, { nullable: true, onDelete: 'CASCADE' })
	@JoinTable()
	public gameRoomsWatcher: Game[];

	constructor(user: Partial<User>) {
		Object.assign(this, user);
	}
}

@Entity('notification')
export class Notifs {
	@PrimaryGeneratedColumn()
	public id: number;

	@Column()
	public text: string; // Bildirim metni

	@Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
	public date: Date; // Bildirim tarihi

	@ManyToOne(() => User, user => user.notifications)
	public user: User; // Kullanıcı ile ilişkilendirme

	@Column({ default: false })
	public read: boolean; // Okunma durumu

	constructor(notification: Partial<Notifs>) {
		Object.assign(this, notification);
	}
}

/**
 * LINK: https://medium.com/@mohitu531/nestjs-7c0eb5655bde
 * Bu 'Entity' nedir ne icin kullanilir?
 * 
 * Nedir?: Veritabani'nin her bir satirini temsil eder.
 * 
 * Bu Entity 'veritabani'mizdaki her bir satiri temsil eden bir siniftir.
 * 
 * LINK: https://wanago.io/2020/06/22/api-nestjs-relationships-postgres-typeorm/
 * Iliskili(Relationship) DB'leri ornekleri.
 */