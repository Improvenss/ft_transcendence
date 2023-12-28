import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto, UpdateUserDto } from './dto/create-user.dto';
import { Notifs, User } from './entities/user.entity';
import { EntityManager, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Socket } from 'socket.io';
import * as fs from 'fs';
import * as path from 'path';
import { CreateNotifsDto } from './dto/create-notifs.dto';


@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(User) // Burada da Repository'i ekliyorsun buraya.
		private readonly	usersRepository: Repository<User>, // Burada olusturdugun 'Repository<>'de DB'ye erisim saglamak icin.

		//@InjectRepository(Notifs)
		//private readonly	notifsRepository: Repository<Notifs>,
	) {}

	// async	addFriend(
	// 	selfUser: User,
	// 	targetUser: string,
	// ){
	// 	const	tmpSelfUser = await this.findUser(selfUser.login, null, ['friends']);
	// 	const	singleSelfUser = Array.isArray(tmpSelfUser) ? tmpSelfUser[0] : tmpSelfUser;

	// 	const	tmpUser = await this.findUser(targetUser, null, ['friends']);
	// 	const	singleUser = Array.isArray(tmpUser) ? tmpUser[0] : tmpUser;

	// 	if (!singleUser || !singleUser.friends || !singleSelfUser || !singleSelfUser.friends)
	// 		throw (new NotFoundException(`users.service.ts: addFriend(): User not found!`));

	// 	const foundUser = singleSelfUser.friends.find(
	// 		(friendUser) => friendUser.login === singleUser.login);
	// 	if (foundUser)
	// 		return (`Already added!`);

	// 		singleSelfUser.friends.push(singleUser);
	// 	const	responseAddFriend = await this.usersRepository.save(singleSelfUser);
	// 	return (responseAddFriend);
	// }

	async addFriend(
		requesterUser: User,
		target: string,
	){
		const	tmpUser = await this.findUser(target, null, ['friends']);
		if (!tmpUser)
			throw new NotFoundException('User not found!');
		const	targetUser = Array.isArray(tmpUser) ? tmpUser[0] : tmpUser;

		if (targetUser.friends.some(friend => friend.id === requesterUser.id))
			throw new Error('Users are already friends.');

		requesterUser.friends = [...requesterUser.friends, targetUser];
		targetUser.friends = [...targetUser.friends, requesterUser];

		await this.usersRepository.save([requesterUser, targetUser]);
	}


	async poke(
		requesterUser: User,
		target: string,
	){
		const	tmpUser = await this.findUser(target, null, ['notifications']);
		if (!tmpUser)
			throw new NotFoundException('User not found!');
		const	targetUser = Array.isArray(tmpUser) ? tmpUser[0] : tmpUser;

		const me = await this.findUser(target);
		const	my = Array.isArray(me) ? me[0] : me;

		const createNotfisDto: CreateNotifsDto = {
			text: `${requesterUser.displayname} poked you!`,
			date: new Date(),
			user:  my,
			read: false,
		};

		const newNotification = new Notifs(createNotfisDto);
		newNotification.text = "abc";
		newNotification.date = new Date();
		newNotification.user = my,
		newNotification.read = false;

		targetUser.notifications.push(newNotification);
		const response = await this.usersRepository.save(targetUser);
		console.log(response);
		return (response);
	}

	async getData(
		user: User,
		action: string[] | string,
	){
		if (typeof action === 'string') {
			action = [action];
		}
		const data = await this.usersRepository.findOne({where: {login: user.login}, relations: action});
		
		const result: Record<string, any> = {};
		action.forEach(rel => {
			if (data && data.hasOwnProperty(rel)) {
			  result[rel] = data[rel];
			}
		});
		return (result);
	}

	async	findUser(
		user: string | undefined,
		socket?: Socket,
		relations?: string[] | 'all' | null,
	){
		// console.log(`UserService: findUser(): relations(${typeof(relations)}): [${relations}]`);
		const relationObject = (relations === 'all')
		? {notifications: true, friends: true, channels: true, adminChannels: true, messages: true, bannedChannels: true, gameRooms: true, gameRoomsAdmin: true, gameRoomsWatcher: true} // relations all ise hepsini ata.
		: (Array.isArray(relations) // eger relations[] yani array ise hangi array'ler tanimlanmis onu ata.
			? relations.reduce((obj, relation) => ({ ...obj, [relation]: true }), {}) // burada atama gerceklesiyor.
			: (typeof(relations) === 'string' // relations array degilse sadece 1 tane string ise,
				? { [relations]: true } // sadece bunu ata.
				: null)); // hicbiri degilse null ata.
		// console.log(`UserService: findUser(): relationsObject(${typeof(relationObject)}):`, relationObject);
		const tmpUser = (user === undefined)
			? await this.usersRepository.find({relations: relationObject})
			: await this.usersRepository.findOne({
					where: {login: user, socketId: socket?.id},
					relations: relationObject
				});
		return (tmpUser);
	}

	// /**
	//  * Burada yeni bir 'user' olusturulup DB'ye kaydediliyor.
	//  * @param createUserDto 
	//  */
	// async	createUser(createUserDto: CreateUserDto) {
	// 	const	newUser = new User(createUserDto);
	// 	await this.entityManager.save(newUser);
	// 	return (`New user created: id[${newUser.id}]`);
	// }

	async	createUser(createUserDto: CreateUserDto) {
		const	tmpUser = await this.findUser(createUserDto.login);
		if (tmpUser)
			return (`User: '${createUserDto.login}' already created.`);
		const	newUser = new User(createUserDto);
		const	response = await this.usersRepository.save(newUser);
		console.log(`New User created: #${response.login}:[${response.id}]`);
		return (`New User created: #${response.login}:[${response.id}]`);
	}

	// /**
	//  * DB'deki butun Users kayitlarini aliyor.
	//  */
	// async	findAll() {
	// 	const tmpUser = await this.usersRepository.find({relations: {channels: true}});
	// 	if (!tmpUser)
	// 		throw (new NotFoundException("user.service.ts: find(): User not found!"));
	// 	return (tmpUser);
	// }

	// /**
	//  * Verilen id'nin karsilik geldigi 'User' verisini donduruyoruz.
	//  * @param id
	//  * @param login
	//  * @returns User.
	//  */
	// async findOne(id?: number, login?: string, relations?: string[]) {
	// 	if (!id && !login)
	// 		throw new Error('Must be enter ID or login.');
	// 	const tmpUser = await this.usersRepository.findOne({
	// 		where: { id: id, login: login },
	// 		relations: relations,
	// 	});
	// 	return (tmpUser);
	// }

	// async findOneSocket(socket: Socket): Promise<User | null> {
	// 	if (!socket)
	// 		throw new Error('Must be enter Socket.');
	// 	const tmpUser = await this.usersRepository.findOne({where: {socketId: socket.id as string}});
	// 	return (tmpUser);
	// }

	// async	putFile(
	// 	file: string | string[] | undefined,
	// ){
		
	// }

	/**
	 * DB'de var olan User verisini guncelliyoruz.
	 * Object.assign(); function'unda updateUserDto json bilgilerini
	 *  tmpUser'e atiyoruz.
	 * @param updateUserDto Guncellemek istedigmiz parametre.
	 * @returns Guncellenen User.
	 */
	async	patchUser(
		user: string | undefined,
		body: Partial<UpdateUserDto>,
	){
		const	tmpUsers = await this.findUser(user, null, 'all');
		if (!tmpUsers)
			return (`User '${user}' not found.`);
		if (!Array.isArray(tmpUsers))
		{ // User seklinde gelirse alttaki for()'un kafasi karismasin diye.
			Object.assign(tmpUsers, body);
			return (await this.usersRepository.save(tmpUsers));
		}
		for (const tmpUser of tmpUsers)
		{ // User[] seklinde gelirse hepsini tek tek guncellemek icin.
			Object.assign(tmpUser, body);
			await this.usersRepository.save(tmpUser);
		}
		return (tmpUsers);
	}

	/**
	 * Login asamasindan sonra User datasi DB'ye kayit edildikten sonra,
	 *  olusturulan Socket.id'sini DB'de guncellemek icin.
	 * @param login 
	 */
	async	updateSocketLogin(login: string, socketId: string) {
		const	tmpUser = await this.findUser(login);
		if (!tmpUser)
			return (null);
		Object.assign(tmpUser, {socketId: socketId});
		return (await this.usersRepository.save(tmpUser as User));
	}

	// /**
	//  * Deleting all User tables.
	//  * @returns 
	//  */
	// async	removeAll() {
	// 	return (this.usersRepository.delete({}));
	// }

	async	deleteUser(
		user: string | undefined,
	){
		const	tmpUser = await this.findUser(user);
		if (!tmpUser)
			return (`User: '${user}' not found.`);
		const	responseUser = await this.usersRepository.remove(tmpUser as User);
		return (responseUser)
	}

	async	deleteFolder(filesFolder: string)
	{
		const uploadsPath = path.join(process.cwd(), filesFolder ? filesFolder: 'uploads');
		if (!fs.existsSync(uploadsPath))
			throw (new NotFoundException(`File path is not exist!: Path: ${uploadsPath}`));
		const files = fs.readdirSync(uploadsPath);
		if (files.length === 0)
		{
			console.warn(`There is no file for delete!: Folder: ${uploadsPath}`);
			return (`There is no file for delete!: ${filesFolder}`);
		}
		for (const file of files) {
			const filePath = path.join(uploadsPath, file);
			fs.unlinkSync(filePath);
			console.log(`File successfully deleted: ${filePath}`);
		}
		// if (!rimraf.sync(uploadsPath)) // Burada dosyanin kendisini sildigimizde; backend yeniden baslatilmazsa herhangi bir PUT islemindeyken hata veriyor. Bu yuzden klasoru silmiyoruz icerisindeki dosyalari siliyoruz.
		// 	return (null);
		console.log(`Folder inside successfully deleted! Folder: ${uploadsPath}`);
		return (`Folder inside succesfully deleted!: ${filesFolder}`);
	}

	async	deleteFilesFromArray(files: string[])
	{
		for (const file of files) {
			const filePath = path.join(process.cwd(), 'uploads', file);
			if (!fs.existsSync(filePath))
			{
				console.warn(`File not found: ${filePath}`);
				continue;
			}
			fs.unlinkSync(filePath);
			console.log(`File successfully deleted: ${filePath}`);
		}
		return (`OK: ${files}`);
	}

	async	deleteFile(
		file: string | string[]| undefined,
	){
		// const filePath = path.join(process.cwd(), 'uploads', file);
		// if (!fs.existsSync(filePath))
		// 	throw (new Error(`File path is not valid: ${filePath}`));
		// fs.unlinkSync(`./uploads/${file}`);
		// console.log(`File successfully deleted. ✅: File Path: ${filePath}`);
		// return (`File deleted successfully.`);

		const responseDelete = (file === undefined)
			? await this.deleteFolder('uploads')
			: (Array.isArray(file) // file array[] ise bu array'deki dosyalar silinecek.
				? await this.deleteFilesFromArray(file)
				: (typeof(file) === 'string' // file array degilse sadece 1 tane string ise,
					? await this.deleteFilesFromArray([`${file}`]) // Burada array[] gibi veriyoruz. Raad sikinti yok.
					: null)); // Hicbiri de olmazssa artik sikinti var demek.
		return (`Delete finish: Status: ${responseDelete}`);
	}

	// async	deleteUser(
	// 	user: string | undefined,
	// ){
	// 	const	tmpGameRoom = await this.findUser(user);
	// 	if (!tmpGameRoom)
	// 		return (`GameRoom: '${user}' not found.`); // 	// await	this.userRepository.delete()
	// 	const	responseGameRoom = await this.gameRepository.remove(tmpGameRoom as User);
	// 	// const	responseGameRoom = await this.entityManager.delete(user);
	// 	return (responseGameRoom)
	// }

	// /**
	//  * Sadece verilen id'ye sahip olan User tablosunu siliyor.
	//  * @param id User id.
	//  * @returns 
	//  */
	// async	remove(id: number) {
	// 	return (this.usersRepository.delete(id));
	// }
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