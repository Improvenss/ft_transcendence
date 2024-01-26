import { Entity,
	Column,
	PrimaryGeneratedColumn,
	ManyToOne,
	ManyToMany,
	OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';

export enum ChannelType {
	PUBLIC = 'public',
	PRIVATE = 'private',
	DM ='directMessage',
}

@Entity('channel')
export class Channel {
	constructor(channel: Partial<Channel>) {
		if (channel&& !/^[a-zA-Z0-9]+$/.test(channel.name)) {
			throw (new Error('The channel name must consist of only alphabetical characters.'));
		}
		Object.assign(this, channel);
	}

	@PrimaryGeneratedColumn()
	public id: number;

	@Column({ length: 20, unique: true , nullable: false})
	@IsNotEmpty()
	public name: string;

	@Column({ nullable: false})
	public description: string; // Kanal tanımı

	@Column({ type: 'enum', enum: ChannelType })
	@IsEnum(ChannelType)
	public type: ChannelType;

	@Column({ nullable: true })
	public owner : number; // Kanalın oluşturan kişi, channeldan ayrılana kadar sahiplik devam eder.

	@Column({ nullable: true }) // Şifre, private kanallar için
	public password: string;

	@Column({ nullable: true })
	public image: string; // Resmin URL'si veya dosya yolu

	//----------------------User----------------------------//

	@ManyToMany(() => User, user => user.channels, {nullable: true, onDelete: 'CASCADE'})
	public members: User[]; // Kanalın üyeleri

	@ManyToMany(() => User, user => user.adminChannels, {nullable: false, onDelete: 'CASCADE'})
	public admins: User[]; // Kanalın yöneticileri

	@ManyToMany(() => User, user => user.bannedChannels, {nullable: false, onDelete: 'CASCADE'})
	public bannedUsers: User[]; // Kanalın Banlı olduğu kullanıcıları

	//----------------------Message----------------------------//

	@OneToMany(() => Message, message => message.channel, { nullable: true, cascade: true, onDelete: 'CASCADE' })
	public messages: Message[]; // Kanalın mesajları

	@IsOptional()
	public status: string;
}

@Entity('message')
export class Message {
	constructor(message: Partial<Message>) {
		Object.assign(this, message);
	}

	@PrimaryGeneratedColumn()
	public id: number;

	@Column({type: 'varchar', length: 2048})
	public content: string; // Mesaj içeriği

	@Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
	public sentAt: Date; // Mesajın gönderildiği tarih

	// @ManyToOne(() => User, user => user.messages)
	@ManyToOne(() => User, user => user.messages, { eager: true })
	public author: User; // Mesajın yazarı

	@ManyToOne(() => Channel, channel => channel.messages, {onDelete: 'CASCADE'}) // Buradaki olay channel silinirken bu mesajlar da silinme durumuna giriyor, bu durumda ne yapacagini soyluyoruz biz { onDelete: 'CASCADE' } diyere. Yani sil diyoruz.
	public channel: Channel; // Mesajın gönderildiği kanal
}

@Entity('dm')
export class Dm {
	constructor(dm: Partial<Dm>) {
		Object.assign(this, dm);
	}

	@PrimaryGeneratedColumn()
	public id: number;

	@Column({ type: 'jsonb' })
	//private _usersData: string; //boş vaktinde bunu string'ten arraye çevir, JSON'ı sil.!
	public usersData: {
		id: number,
		login: string,
		displayname: string,
		imageUrl: string
	}[];

	// "usersData" alanını çözmek için bir metod ekleyebilirsiniz
	//get usersData(): {
	//	id: number, login: string, displayname: string, imageUrl: string
	//}[] {
	//	return JSON.parse(this._usersData);
	//}

	//set usersData(data: { id: number, login: string, displayname: string, imageUrl: string }[]) {
	//	this._usersData = JSON.stringify(data); //kaydetme işlemi için
	//}

	//@Column()
	//public usersData: {
	//	id: number,
	//	login: string,
	//	displayname: string,
	//	imageUrl: string
	//}[];

	@ManyToMany(() => User, user => user.dm, {nullable: true, onDelete: 'CASCADE'})
	public members: User[];

	@OneToMany(() => DmMessage, dmMessage => dmMessage.dm, { cascade: true, onDelete: 'CASCADE' })
	public messages: DmMessage[];

	//toJSON() {
    //    return {
	//		id: this.id,
	//		members: this.members,
	//		messages: this.messages,
    //        usersData: this.usersData,
    //        // Include any other properties you want to expose
    //    };
    //}
}

@Entity('dm_message')
export class DmMessage {
	@PrimaryGeneratedColumn()
	public id: number;

	@Column()
	public content: string; // Mesaj içeriği

	@Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
	public sentAt: Date; // Mesajın gönderildiği tarih

	@ManyToOne(() => User, user => user.dmMessages, { eager: true })
	public author: User; // Mesajın yazarı

	@ManyToOne(() => Dm, dm => dm.messages, { onDelete: 'CASCADE' })
	public dm: Dm; // Mesajın ait olduğu DM
}
