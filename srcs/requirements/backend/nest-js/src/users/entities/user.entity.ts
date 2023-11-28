import { Column, Entity, OneToMany, PrimaryGeneratedColumn, ManyToMany, JoinTable } from "typeorm";
import { Channel, Message } from "src/chat/entities/chat.entity";

@Entity({name: 'user'})
export class User {
	@PrimaryGeneratedColumn()
	public id: number;

	@Column()
	public login: string;

	@Column({nullable: true})
	public socket_id?: string;

	@Column()
	public first_name: string;

	@Column()
	public last_name: string;

	@Column({type: "text", nullable: true})
	public email: string;

	@Column({type: "text", nullable: true})
	public image: string;
	// public image: {
		// link: string,
		// versions: {
		// 	large: string;
		// 	medium: string;
		// 	micro: string;
		// 	small: string;
		// }
	// }

	@ManyToMany(() => Channel, channel => channel.users, {cascade: true})
	@JoinTable()
	public channels: Channel[];

	@ManyToMany(() => Channel, channel => channel.admins)
	@JoinTable()
	public adminChannels: Channel[];

	@OneToMany(() => Message, message => message.user)
	public messages: Message[];

	constructor(user: Partial<User>) {
		Object.assign(this, user);
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