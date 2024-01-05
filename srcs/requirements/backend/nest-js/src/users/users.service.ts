import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto, UpdateUserDto } from './dto/create-user.dto';
import { Notif, User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Socket } from 'socket.io';
import * as fs from 'fs';
import * as path from 'path';
import { CreateNotifDto } from './dto/create-notifs.dto';
import { FindOptionsRelations, FindOptionsSelect } from 'typeorm';

@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(Notif)
		private readonly	notifRepository: Repository<Notif>,
		@InjectRepository(User) // Burada da Repository'i ekliyorsun buraya.
		private readonly	usersRepository: Repository<User>, // Burada olusturdugun 'Repository<>'de DB'ye erisim saglamak icin.

	) {}

	async friendRequest(
		action: 'sendFriendRequest' | 'acceptFriendRequest' | 'declineFriendRequest',
		requesterUser: User,
		target: string,
	){
		if (requesterUser.login === target)
			throw new Error("You can't perform friend actions on yourself.");

		const	targetUser = await this.getData({userLogin: target}, 'friends', 'true');
		if (!targetUser)
			throw new NotFoundException('User not found!');

		if (targetUser.friends.some(friend => friend.id === requesterUser.id))
			throw new Error('Users are already friends.');

		let message = '';

		switch (action){
			case 'sendFriendRequest':
				message =  `${requesterUser.displayname}(${requesterUser.login}) send friend request!`;
				break;
			case 'acceptFriendRequest':
				const	requester = await this.getData({userLogin: requesterUser.login}, 'friends', 'true');
				if (!requester)
					throw new NotFoundException('User not found!');

				requester.friends = [...requester.friends, targetUser];
				targetUser.friends = [...targetUser.friends, requester];

				await this.usersRepository.save([requester, targetUser]);
				message = `${requester.displayname}(${requesterUser.login}) accepted the friend request.`;
				break;
			case 'declineFriendRequest':
				message = `${requesterUser.displayname}(${requesterUser.login}) rejected the friend request!`;
				break;
			default:
				break;
		}

		return (await this.createNotif(requesterUser.login, target, action, message));
	}

	async notifsMarkRead(
		userLogin: string,
	){
		const userData = await this.getData({userLogin: userLogin}, 'notifications');
		userData.notifications.forEach(notif => notif.read = true);
		await this.notifRepository.save(userData.notifications);
	}

	async createNotif(
		requesterUser: string,
		target: string,
		action: string,
		text: string,
	){
		const	targetUser = await this.getData({userLogin: target});
		if (!targetUser)
			throw new NotFoundException('User not found!');
		const	notifs = await this.getData({userLogin: target}, 'notifications');

		const createNotfiDto: CreateNotifDto = {
			type: action,
			text: text,
			date: new Date(),
			user: targetUser,
			read: false,
			from: requesterUser,
		};

		const newNotif = new Notif(createNotfiDto);
		notifs.notifications.push(newNotif);
		await this.notifRepository.save(newNotif);
		return (newNotif);
	}

	async deleteNotif(
		userId: number,
		notifId: number,
	){
		const notification = await this.notifRepository.findOne({where: {id: notifId} , relations: ['user']});
		if (!notification) {
			throw new NotFoundException('Notification not found!');
		}
		if (notification.user.id !== userId) {
			throw new ForbiddenException('You are not allowed to delete this notification!');
		}
		await this.notifRepository.delete(notifId);
	}

	// user'a ait tüm bilgilere ihtiyacım olmadığından dolayı gerek yok ama kalsın
	async getRelationNames(): Promise<string[]> {
		const metadata = this.usersRepository.metadata;
		const relationNames = metadata.relations.map((relation) => relation.propertyName);
		return relationNames;
	}

	/* 
		Kullanımı: getAllData({select: {login: true}, relations: {}})
		Tüm kullanıcılara ait belirlenen default + relation verileri çekebilirsin.
		Backend'i çok yoruyor.
	 */
	async getAllData({select, relations}:{
		select: FindOptionsSelect<User>,
		relations: FindOptionsRelations<User>,
	}){
		return (await this.usersRepository.find({select, relations}));
	}

	/* Belirtilen relation'da hangi relation değeri(adı) ise kayıtlı kullanıcıların select değeri veya userın tüm bilgisi(default) dönüyor */
	async getUsersInRelation({relation, value, select}: {relation: string, value: string, select: string}): Promise<string[]> {
		const usersInRelation = await this.usersRepository
			.createQueryBuilder('user')
			.innerJoin(`user.${relation}`, 'relation', `relation.name = :value`, { value })
			.select(`user.${select}`, 'selectedField')
			.getRawMany();

		return usersInRelation.map(result => result.selectedField);
	}


	async getData(
		who: {userLogin?: string, socketId?: string},
		relation?: string[] | string,
		primary?: 'true',
	){
		if (!who.userLogin && !who.socketId) {
			throw new Error('Either login or socketId must be provided.');
		}

		if (who.userLogin && who.socketId) {
			throw new Error('Provide only one of userLogin or socketId, not both.');
		}

		if (typeof relation === 'string') {
			relation = [relation];
		}

		const whereClause = who.userLogin ? { login: who.userLogin } : { socketId: who.socketId };
		const data = await this.usersRepository.findOne({where: whereClause, relations: relation});
		if (!data)
			throw new NotFoundException('User not found!');

		if (relation === undefined || primary === 'true'){
			return (data);
		}

		const result: Partial<User> = {};
		relation.forEach(rel => {
			if (data && data.hasOwnProperty(rel)) {
				result[rel] = data[rel];
			}
		});
		return (result as User);
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