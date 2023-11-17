import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";

// @Entity()
// export class Image {
// 	@PrimaryGeneratedColumn()
// 	id: number

// 	@Column()
// 	link: string

// 	@Column()
// 	versions: {
// 		large: string;
// 		medium: string;
// 		micro: string;
// 		small: string;
// 	}
// }

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