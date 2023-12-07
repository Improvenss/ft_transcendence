import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { EntityManager, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Socket } from 'socket.io';

@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(User) // Burada da Repository'i ekliyorsun buraya.
		private readonly	usersRepository: Repository<User>, // Burada olusturdugun 'Repository<>'de DB'ye erisim saglamak icin.
		private readonly	entityManager: EntityManager
	) {}

	/**
	 * Burada yeni bir 'user' olusturulup DB'ye kaydediliyor.
	 * @param createUserDto 
	 */
	async	create(createUserDto: CreateUserDto) {
		const	newUser = new User(createUserDto);
		await this.entityManager.save(newUser);
		return (`New user created: id[${newUser.id}]`);
	}

	/**
	 * DB'deki butun Users kayitlarini aliyor.
	 */
	async	findAll() {
		const tmpUser = await this.usersRepository.find({relations: {channels: true}});
		if (!tmpUser)
			throw (new NotFoundException("user.service.ts: find(): User not found!"));
		return (tmpUser);
	}

	/**
	 * Verilen id'nin karsilik geldigi 'User' verisini donduruyoruz.
	 * @param id
	 * @param login
	 * @returns User.
	 */
	async findOne(id?: number, login?: string, relations?: string[]) {
		if (!id && !login)
			throw new Error('Must be enter ID or login.');
		const tmpUser = await this.usersRepository.findOne({
			where: { id: id, login: login },
			relations: relations,
		});
		return (tmpUser);
	}

	async findOneSocket(socket: Socket): Promise<User | null> {
		if (!socket)
			throw new Error('Must be enter Socket.');
		console.log("socket.id:", socket.id);
		const tmpUser = await this.usersRepository.findOne({where: {socketId: socket.id as string}});
		return (tmpUser);
	}

	/**
	 * DB'de var olan User verisini guncelliyoruz.
	 * Object.assign(); function'unda updateUserDto json bilgilerini
	 *  tmpUser'e atiyoruz.
	 * @param id Guncellenecek olan User id'si.
	 * @param updateUserDto Guncellemek istedigmiz parametre.
	 * @returns Guncellenen User.
	 */
	async	update(id: number, updateUserDto: UpdateUserDto) {
		const	tmpUser = await this.findOne(id);
		Object.assign(tmpUser, updateUserDto);
		return (await this.entityManager.save(tmpUser));
	}

	/**
	 * Login asamasindan sonra User datasi DB'ye kayit edildikten sonra,
	 *  olusturulan Socket.id'sini DB'de guncellemek icin.
	 * @param login 
	 */
	async	updateSocketLogin(login: string, socketData: string) {
		const	tmpUser = await this.findOne(undefined, login);
		if (!tmpUser)
			throw (new NotFoundException("users.service.ts: updateSocketLogin: User not found"));
		Object.assign(tmpUser, socketData);
		return (await this.entityManager.save(tmpUser));
	}

	/**
	 * Deleting all User tables.
	 * @returns 
	 */
	async	removeAll() {
		return (this.usersRepository.delete({}));
	}

	/**
	 * Sadece verilen id'ye sahip olan User tablosunu siliyor.
	 * @param id User id.
	 * @returns 
	 */
	async	remove(id: number) {
		return (this.usersRepository.delete(id));
	}
}


/**
 * LINK: https://medium.com/@mohitu531/nestjs-7c0eb5655bde
 * Bu 'Service'(Hizmet) nedir ne icin kullanilir?
 * 
 * Nedir?: Veri ile ilgiyi isler, veritabani ile baglantilidir.
 * 
 * Bu Service dosyasi genellikle 'veritabani' ve 'HTTP' istekleri
 *  gibi islevler icin kullanilir.
 */

/**
 * NOTES:
 * 
 * 			PostgreSQL databaseye terminalden erisim.
 * Ilk olarak containerimize baglanmamiz gerekiyor.
 * 	$> docker exec -it <postgres_container> /bin/sh
 * ornek: $> docker exec -it postgres> /bin/sh
 * Artik 'psql' komutuna ve 'database'mize erisebiliyoruz.
 * 	$> psql -U <db_name> \l
 * Komutu ile transcendence 'user'imizle 'database'leri listeliyoruz.
 * Burada bizim 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
gsever@k2m14s08 ~ % docker exec -it postgres /bin/sh


/ # psql -U transcendence -l
                                                                                 List of databases
                       Name                       |     Owner     | Encoding | Locale Provider |  Collate   |   Ctype    | ICU Locale | ICU Rules |        Access privileges
--------------------------------------------------+---------------+----------+-----------------+------------+------------+------------+-----------+---------------------------------
 asdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdf | transcendence | UTF8     | libc            | en_US.utf8 | en_US.utf8 |            |           |
 postgres                                         | transcendence | UTF8     | libc            | en_US.utf8 | en_US.utf8 |            |           |
 template0                                        | transcendence | UTF8     | libc            | en_US.utf8 | en_US.utf8 |            |           | =c/transcendence               +
                                                  |               |          |                 |            |            |            |           | transcendence=CTc/transcendence
 template1                                        | transcendence | UTF8     | libc            | en_US.utf8 | en_US.utf8 |            |           | =c/transcendence               +
                                                  |               |          |                 |            |            |            |           | transcendence=CTc/transcendence
 transcendence_db                                 | transcendence | UTF8     | libc            | en_US.utf8 | en_US.utf8 |            |           |
(5 rows)



/ # psql -U transcendence \transcendence_db
psql (16.0)
Type "help" for help.
transcendence_db=#



transcendence_db=# CREATE TABLE sample_table_ehehehe ( id SERIAL PRIMARY KEY, name VARCHAR(100));
CREATE TABLE
transcendence_db=#




transcendence_db=# \dt
                   List of relations
 Schema |         Name         | Type  |     Owner
--------+----------------------+-------+---------------
 public | sample_table_ehehehe | table | transcendence
(1 row)
transcendence_db=#





transcendence_db=# INSERT INTO sample_table_ehehehe (id, name) VALUES (1, 'ustaammmmmmmmm');
INSERT 0 1
transcendence_db=#



\? de help sayfasini aciyor bakabilirsin oradan.

 * 
 */