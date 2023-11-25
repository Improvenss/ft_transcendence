import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn, ManyToMany, JoinTable } from "typeorm";
import { Channel, Message } from "src/chat/entities/chat.entity";

@Entity()
export class User {
	@PrimaryGeneratedColumn()
	id: number

	@Column()
	login: string

	@Column({nullable: true})
	socket_id?: string

	@Column()
	first_name: string

	@Column()
	last_name: string

	@Column({type: "text", nullable: true})
	email: string

	// @OneToOne(() => Image)
	// @JoinColumn()
	@Column({type: "text", nullable: true})
	// image: string
	image: {
		link: string,
		versions: {
			large: string;
			medium: string;
			micro: string;
			small: string;
		}
	}
	// image: Image;

	@ManyToMany(() => Channel, channel => channel.admins)
	@JoinTable()
	channels: Channel[];
  
	@OneToMany(() => Message, message => message.user)
	messages: Message[];

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
 */