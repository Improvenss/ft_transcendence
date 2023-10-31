import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
class	User {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	name: string;
}

export default User;

/**
 * Bu 'Entity' nedir ne icin kullanilir?
 * 
 * Nedir?: Veritabani'nin her bir satirini temsil eder.
 * 
 * Bu Entity 'veritabani'mizdaki her bir satiri temsil eden bir siniftir.
 */