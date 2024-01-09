import { Column, Entity, PrimaryGeneratedColumn, ManyToMany, OneToMany, JoinTable, JoinColumn, ManyToOne } from "typeorm";
import { Channel, Message } from "src/chat/entities/chat.entity";
import { Game } from "src/game/entities/game.entity";
import { IsEmail, IsEnum } from "class-validator";
import { GameHistory } from "src/game/entities/gameHistory.entity";

export enum UserStatus {
	ONLINE = 'online',
	OFFLINE = 'offline',
	IN_CHAT = 'in-chat',
	IN_GAME = 'in-game',
	AFK = 'afk',
}

// Public olarak belirtilmese dahi public olarak ele alınmaktadır.
// @Entity({name: 'user'})
@Entity('user')
export class User {
	constructor(user: Partial<User>) {
		Object.assign(this, user);
	}

	@PrimaryGeneratedColumn()
	public id: number; // Database'deki sıralama için değişken

	//----------------------Mandatory----------------------------//

	// @Column({type: "text", nullable: true})
	@Column({ unique: true })
	@IsEmail()
	public email: string; // Intra email

	@Column({ unique: true })
	public login: string; // Intra login

	@Column({ unique: true })
	public displayname: string; // Intra ad-soyad

	@Column({ unique: true })
	public imageUrl: string; // Intra resim linki

	@Column({ unique: true, nullable: true })
	public socketId: string;; // Websocket

	//----------------------Status----------------------------//

	@Column({ type: 'enum', enum: UserStatus, default: UserStatus.OFFLINE })
	@IsEnum(UserStatus)
	public status: UserStatus;

	// @Column({ default: 'offline' }) // Default olarak offline olarak tanımlandı
	// public status: 'online' | 'offline' | 'in-chat' | 'in-game' | 'afk'

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

	@OneToMany(() => Notif, notification => notification.user, {cascade: true})
	public notifications: Notif[];

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

	@OneToMany(() => GameHistory, history => history.user, {
		nullable: true,
		cascade: true,
	})
	@JoinTable()
	public gameHistory: GameHistory[];

	// game achievementler
	
	// Aktif oldugu oyun odasi.
	@Column({ nullable: true })
	public currentRoomId: number;

	@ManyToOne(() => Game, game => game.players)
	@JoinColumn({ name: 'currentRoomId' })
	public currentRoom: Game;
}

export enum NotificationType {
	TEXT = 'text',
	SEND_FRIEND_REQUEST = 'sendFriendRequest',
	ACCEPT_FRIEND_REQUEST = 'acceptFriendRequest',
	DECLINE_FRIEND_REQUEST = 'declineFriendRequest',
}

@Entity('notification')
export class Notif {
	@PrimaryGeneratedColumn()
	public id: number;

	@Column({ type: 'enum', enum: NotificationType })
	@IsEnum(NotificationType)
	public type: NotificationType;

	@Column()
	public text: string; // Bildirim metni

	@Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
	public date: Date; // Bildirim tarihi

	@ManyToOne(() => User, user => user.notifications)
	public user: User; // Kullanıcı ile ilişkilendirme

	@Column({ default: false })
	public read: boolean; // Okunma durumu

	@Column()
	public from: string; // Gönderen kişinin logini

	constructor(notification: Partial<Notif>) {
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