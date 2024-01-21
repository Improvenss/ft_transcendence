import { Column, Entity, PrimaryGeneratedColumn, ManyToMany, OneToMany, JoinTable, JoinColumn, ManyToOne } from "typeorm";
import { Channel, Dm, DmMessage, Message } from "src/chat/entities/chat.entity";
import { Game } from "src/game/entities/game.entity";
import { IsEmail, IsEnum, IsNumber } from "class-validator";

export enum UserStatus {
	ONLINE = 'online',
	OFFLINE = 'offline',
	IN_CHAT = 'in-chat',
	IN_GAME = 'in-game',
	AFK = 'afk',
}

export enum AchivmentName {
	FIRST_WIN = 'First Win',
	FIRST_TIE = 'First Tie',
	FIRST_LOSE = 'First Lose',
	WIN_AGANIST_YOUR_FRIEND = 'Win Against Your Friend',
	LEADERBOARD_CHAMPION = 'Leaderboard Champion',
	LOSE_STREAK = 'Lose Streak',
	WIN_STREAK = 'Win Streak'
}

const achivmentIcons: Record<AchivmentName, string> = {
	[AchivmentName.FIRST_WIN]: 'iconFirstWin.svg',
	[AchivmentName.FIRST_TIE]: 'iconFirstTie.svg',
	[AchivmentName.FIRST_LOSE]: 'iconFirstLose.svg',
	[AchivmentName.WIN_AGANIST_YOUR_FRIEND]: 'iconWinAgainstYourFriend.svg',
	[AchivmentName.LEADERBOARD_CHAMPION]: 'iconLeaderboardChampion.svg',
	[AchivmentName.LOSE_STREAK]: 'icon5LoserStreak.svg',
	[AchivmentName.WIN_STREAK]: 'icon5WinStreak.svg'
};


// Public olarak belirtilmese dahi public olarak ele alınmaktadır.
// @Entity({name: 'user'})
@Entity('user')
export class User {
	constructor(user: Partial<User>) {
		Object.assign(this, user);

		if (!this.achivments) {
			this.achivments = [
				...Object.values(AchivmentName).map(name => ({
					name,
					progress: 0,
					icon: achivmentIcons[name],
					achievedDate: null
				})),
			];
		}
	}

	@PrimaryGeneratedColumn()
	public id: number; // Database'deki sıralama için değişken

	//----------------------Mandatory----------------------------//

	@Column({ unique: true })
	@IsEmail()
	public email: string; // Intra email

	@Column({ unique: true })
	public login: string; // Intra login

	@Column({ nullable: true, default: false })
	public twoFactorAuthIsEnabled: boolean; // 2fa is on

	@Column({ unique: true, nullable: true, default: null})
	public twoFactorAuthSecret: string; // 2fa secret

	@Column({ unique: true })
	public displayname: string; // Intra ad-soyad

	@Column({ unique: true })
	public imageUrl: string; // Intra resim linki

	@Column({ unique: true, nullable: true })
	public socketId: string; // Websocket

	//----------------------Status----------------------------//

	@IsEnum(UserStatus, { message: 'Invalid User status' })
	@Column({ type: 'enum', enum: UserStatus, default: UserStatus.OFFLINE })
	public status: UserStatus;

	//----------------------Optional----------------------------//

	@Column({ nullable: true })
	public nickname: string; // Kullanıcı tarafından eklenen ekstra isim

	@Column({ nullable: true })
	public avatar: string; // Kullanıcı tarafından eklenen ekstra resim

	//----------------------Friends----------------------------//

	@ManyToMany(() => User, user => user.friends)
	@JoinTable()
	public friends: User[];

	//----------------------BlockUsers----------------------------//

	@ManyToMany(() => User, user => user.blockUsers)
	@JoinTable()
	public blockUsers: User[];

	//----------------------Notfis----------------------------//

	@OneToMany(() => Notif, notification => notification.user, {cascade: true})
	public notifications: Notif[];

	//----------------------Achivments----------------------------//

	@Column('jsonb', { nullable: true })
	public achivments: {
		name: AchivmentName,
		progress: number,
		icon: string,
		achievedDate?: Date
	}[];

	//----------------------Channel&Messages----------------------------//

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

	@OneToMany(() => Message, message => message.author, {nullable: true})
	@JoinTable()
	public messages: Message[]; // Kullanıcının gönderdiği ve aldığı mesajlar

	//----------------------DirectMessage&Messages----------------------------//

	@ManyToMany(() => Dm, dm => dm.members, {cascade: true})
	@JoinTable()
	public dm: Dm[];

	@OneToMany(() => DmMessage, message => message.author, {nullable: true})
	@JoinTable()
	public dmMessages: DmMessage[];

	//----------------------Game-------------------------------//

	@Column({ type: 'integer', default: 0 })
	public _xp: number;

	private nextLevel(level: number): number {
		//return round((4 * pow(level, 3)) / 5);
        return 500 * (Math.pow(level, 2)) - (500 * level);
    }

	get xp(): {
		level: number,
		percentage: number,
	}{
		let currentXP = this._xp;

		let level = 1;
        let nextLevelXP = this.nextLevel(level);

        while (currentXP >= nextLevelXP) {
            level++;
            nextLevelXP = this.nextLevel(level);
        }

        const currentLevelXP = this.nextLevel(level - 1);
        nextLevelXP = this.nextLevel(level);

        const percentage = (currentXP - currentLevelXP) / (nextLevelXP - currentLevelXP) * 100;

        return {
            level: level - 1,
            percentage: percentage
        };
    }

	set xp(value: number){
		this._xp = value;
	}

	@OneToMany(() => GameHistory, history => history.user, {
		nullable: true,
		cascade: true,
	})
	@JoinTable()
	public gameHistory: GameHistory[];

	// Aktif oldugu oyun odasi.
	@Column({ nullable: true })
	public currentRoomId: number;

	@ManyToOne(() => Game, game => game.players, {onDelete: 'SET NULL'})
	@JoinColumn({ name: 'currentRoomId' })
	public currentRoom: Game;
}

export enum NotificationType {
	TEXT = 'text',
	SEND_FRIEND_REQUEST = 'sendFriendRequest',
	ACCEPT_FRIEND_REQUEST = 'acceptFriendRequest',
	DECLINE_FRIEND_REQUEST = 'declineFriendRequest',
	UNFRIEND = 'unFriend',
	INVITE = 'invite',
}

@Entity('notification')
export class Notif {
	constructor(notification: Partial<Notif>) {
		Object.assign(this, notification);
	}

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
}


export enum GameStatus {
	WIN = 'win',
	LOSE = 'lose',
	TIE = 'tie',
}

@Entity('gameHistory')
export class GameHistory {
	constructor(gameHistory: Partial<GameHistory>) {
		Object.assign(this, gameHistory);
	}

	@IsNumber()
	@PrimaryGeneratedColumn()
	public id: number;

	@ManyToOne(() => User, user => user.gameHistory)
	public user: User;

	@Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
	public date: Date;

	@Column()
	public name: string;
	
	@Column()
	public rival: string;

	@Column({ type: 'enum', enum: GameStatus})
	public result: GameStatus;

	//@IsNumber()
	//@Min(0, { message: 'Game history score must be at least 0' })
	//@Max(999, { message: 'Game history score cannot be greater than 999' })
	//@Column({ default: 0, nullable: false })
	//public score: number;
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