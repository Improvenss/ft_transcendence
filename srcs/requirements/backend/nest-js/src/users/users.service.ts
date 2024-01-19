import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { Notif, NotificationType, User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
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
		action: 'sendFriendRequest' | 'acceptFriendRequest' | 'declineFriendRequest' | 'unFriend',
		sourceUser: User,
		destId: number,
	){
		if (sourceUser.id === destId)
			throw new Error("You can't perform friend actions on yourself.");

		const targetUser = await this.getUserRelation({
			user: { id: destId },
			relation: { friends: true },
			primary: true,
		})
		if (!targetUser)
			throw new NotFoundException('User not found!');

		if (action !== 'unFriend' && targetUser.friends.some(friend => friend.id === sourceUser.id))
			throw new Error('Users are already friends.');

		let message = '';

		switch (action){
			case 'sendFriendRequest':
				message =  `${sourceUser.displayname}(${sourceUser.login}) send friend request!`;
				break;
			case 'acceptFriendRequest':

				const requester = await this.getUserRelation({
					user: { login: sourceUser.login },
					relation: { friends: true },
					primary: true,
				})
				if (!requester)
					throw new NotFoundException('User not found!');

				requester.friends = [...requester.friends, targetUser];
				targetUser.friends = [...targetUser.friends, requester];

				await this.usersRepository.save([requester, targetUser]);
				message = `${requester.displayname}(${sourceUser.login}) accepted the friend request.`;
				break;
			case 'declineFriendRequest':
				message = `${sourceUser.displayname}(${sourceUser.login}) rejected the friend request!`;
				break;
			case 'unFriend':
				message = `${sourceUser.displayname}(${sourceUser.login}) is no longer friends with you.!`;
				const requesterUser = await this.getUserRelation({
					user: { login: sourceUser.login },
					relation: { friends: true },
					primary: true,
				})
				if (!requesterUser)
					throw new NotFoundException('User not found!');

				targetUser.friends = targetUser.friends.filter((user) => user.id !== sourceUser.id);
				requesterUser.friends = requesterUser.friends.filter((user) => user.id !== targetUser.id);
				await this.usersRepository.save([requesterUser, targetUser]);
				break;
			default:
				break;
		}
		return (await this.createNotif(sourceUser.id, destId, action, message));
	}

	async blockAction(
		action: 'block' | 'unblock',
		sourceId: number,
		destId: number,
	){
		if (sourceId === destId)
			throw new Error("You can't perform block actions on yourself.");

		const sourceUser = await this.getUserRelation({
			user: { id: sourceId },
			relation: { blockUsers: true },
			primary: true,
		})
		if (!sourceUser)
			throw new NotFoundException('User not found!');

		const targetUser = await this.getUserPrimary({ id: destId })
		if (!targetUser)
			throw new NotFoundException('User not found!');

		let message = '';
		if (action === 'block'){
			sourceUser.blockUsers = [...sourceUser.blockUsers, targetUser];
			await this.usersRepository.save([sourceUser]);
			message = `${sourceUser.displayname}(${sourceUser.login}) is blocked you.!`;
		} else {
			sourceUser.blockUsers = sourceUser.blockUsers.filter((user) => user.id !== destId);
			await this.usersRepository.save([sourceUser]);
			message = `${sourceUser.displayname}(${sourceUser.login}) unblocked you.!`;
		}

		return (await this.createNotif(sourceId, destId, 'text', message));
	}

	async notifsMarkRead(
		userId: number,
	){
		const notifs = await this.getUserRelation({
			user: { id: userId },
			relation: { notifications: true },
			primary: false,
		});
		notifs.notifications.forEach(notif => notif.read = true);
		await this.notifRepository.save(notifs.notifications);
	}

	async createNotif(
		sourceId: number,
		destId: number,
		action: string,
		text: string,
	){
		if (!Object.values(NotificationType).includes(action as NotificationType)) {
			throw new BadRequestException(`Invalid notification type: ${action}`);
		}

		const source = await this.getUserPrimary({id: sourceId});
		const destination = await this.getUserPrimary({id: destId});

		const createNotfiDto: CreateNotifDto = {
			type: action as NotificationType,
			text: text,
			date: new Date(),
			user: destination,
			read: false,
			from: source.login,
		};

		const newNotif = new Notif(createNotfiDto);
		return (await this.notifRepository.save(newNotif));
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

	async getUserChannelRelationDetails(
		id: number,
		nestedRelations: string[],
	){
		const data = await this.usersRepository.findOne({
			where: {id: id},
			relations: nestedRelations, // channels, channels.members, channels.admins ...
		});

		return (data['channels']);
	}

	async getUserDmRelationDetails(
		id: number,
		nestedRelations: string[],
	){
		const data = await this.usersRepository.findOne({
			where: {id: id},
			relations: nestedRelations, // dm, dm.members, dm.messages ...
		});

		return (data['dm']);
	}

	async getUserGameRelationDetails(
		id: number,
		nestedRelations: string[],
	){
		const data = await this.usersRepository.findOne({
			where: {id: id},
			relations: nestedRelations, // currentRoom, currentRoom.players ...
		});
		return (data['currentRoom']);
	}

	parsedRelation(relation: string[] | string): FindOptionsRelations<User> {
		if (Array.isArray(relation)) {
			const parsedRelation: FindOptionsRelations<User> = {};
			relation.forEach(rel => {
				parsedRelation[rel] = true;
			});
			return parsedRelation;
		} else if (typeof relation === 'string') {
			const parsedRelation: FindOptionsRelations<User> = {};
			parsedRelation[relation] = true;
			return parsedRelation;
		} else {
			throw new Error('Invalid relation format');
		}
	}

	/* burdaki alınan değerler select'te olabilir lakin güvenlikli mi bilgim yok.
		Belirlenen kullanıcı verisine göre kullanıcın default yapılarını döndürüyor.
	*/
	async getUserPrimary({id, login, socketId}: {
		id?: number,
		login?: string,
		socketId?: string,
	}, exception: boolean = true){
		const inputSize = [id, login, socketId].filter(Boolean).length;
		if (inputSize !== 1){
			throw new Error('Provide exactly one of id, login, or socketId.');
		}

		const whereClause: Record<string, any> = {
			id: id,
			login: login,
			socketId: socketId,
		};
		
		const user = await this.usersRepository.findOne({where: whereClause});
		if (!user && exception)
			throw new NotFoundException('User not found!');
		return (user);
	}

	/* user'ın default ve relation verilerini döndürür, 
		user name + relation(full) + primary(false) -> relation
		user name + relation(full) + primary(true) -> default + relation
		user name + relation(empty) + primary(false) -> relation all 
		user name + relation(empty) + primary(true) -> default + relation all 
	*/
	async getUserRelation({user, relation, primary}:{
		user: {id?: number, login?: string, socketId?: string},
		relation: FindOptionsRelations<User>,
		primary: boolean,
	}){
		const inputSize = [user.id, user.login, user.socketId].filter(Boolean).length;
		if (inputSize !== 1){
			throw new Error('Provide exactly one of id, login, or socketId.');
		}
	
		if (Object.keys(relation).length === 0){
			const allChannelRelation = await this.getRelationNames();
			relation = allChannelRelation.reduce((acc, rel) => {
				acc[rel] = true;
				return acc;
			}, {} as FindOptionsRelations<User>);
		}

		const whereClause: Record<string, any> = {
			id: user.id,
			login: user.login,
			socketId: user.socketId,
		};

		const data = await this.usersRepository.findOne({where: whereClause, relations: relation});
		if (!data){
			throw new NotFoundException('User not found!');
		}

		if (primary === true){ // default + relation
			return (data);
		}

		const result: Partial<User> = {};
		// Sadece ilişkileri döndür
		Object.keys(relation).forEach((rel) => {
			result[rel] = data[rel];
		});

		return result as User;
	}

	async	createUser(createUserDto: CreateUserDto) {
		const user = await this.usersRepository.findOne({where: {login: createUserDto.login}});
		if (user){
			console.log(`User: '${user.login}' already created.`);
			return (user);
		} else {
			const	newUser = new User(createUserDto);
			const	response = await this.usersRepository.save(newUser);
			console.log(`New User created: #${response.login}:[${response.id}]`);
			return (response);
		}
	}

	async updateUser({id, avatar, nickname, socketId, status, twoFactorAuthSecret, twoFactorAuthIsEnabled}: {
		id: number,
		avatar?: string,
		nickname?: string,
		socketId?: string,
		status?: string,
		twoFactorAuthSecret?: string,
		twoFactorAuthIsEnabled?: boolean,
	}){
		const user = await this.usersRepository.findOne({where: {id: id}});
		if (user){
			const tmpUser = await this.getUserPrimary({id: id});
			Object.assign(tmpUser, { avatar, nickname, socketId, status, twoFactorAuthSecret, twoFactorAuthIsEnabled });
			await this.usersRepository.save(tmpUser);
		}
	}

	// /**
	//  * DB'de var olan User verisini guncelliyoruz.
	//  * Object.assign(); function'unda updateUserDto json bilgilerini
	//  *  tmpUser'e atiyoruz.
	//  * @param updateUserDto Guncellemek istedigmiz parametre.
	//  * @returns Guncellenen User.
	//  */
	// async	patchUser(
	// 	user: string | undefined,
	// 	body: Partial<UpdateUserDto>,
	// ){
	// 	// const	tmpUsers = await this.findUser(user, null, 'all');
	// 	const tmpUsers = await this.getUserRelation({
	// 		user: {login: user},
	// 		relation: {},
	// 		primary: true,
	// 	})
	// 	if (!tmpUsers)
	// 		return (`User '${user}' not found.`);
	// 	if (!Array.isArray(tmpUsers))
	// 	{ // User seklinde gelirse alttaki for()'un kafasi karismasin diye.
	// 		Object.assign(tmpUsers, body);
	// 		return (await this.usersRepository.save(tmpUsers));
	// 	}
	// 	for (const tmpUser of tmpUsers)
	// 	{ // User[] seklinde gelirse hepsini tek tek guncellemek icin.
	// 		Object.assign(tmpUser, body);
	// 		await this.usersRepository.save(tmpUser);
	// 	}
	// 	return (tmpUsers);
	// }

	// /**
	//  * Login asamasindan sonra User datasi DB'ye kayit edildikten sonra,
	//  *  olusturulan Socket.id'sini DB'de guncellemek icin.
	//  * @param login 
	//  */
	// async updateSocketLogin(login: string, socketId: string) {
	// 	const tmpUser = await this.getUserPrimary({login: login});
	// 	if (!tmpUser){
	// 		throw (new NotFoundException(`User ${login} not found.`));
	// 	}
	// 	Object.assign(tmpUser, {socketId: socketId});
	// 	return (await this.usersRepository.save(tmpUser));
	// }

	// async	deleteUser(
	// 	user: string | undefined,
	// ){
	// 	const	tmpUser = await this.findUser(user);
	// 	if (!tmpUser)
	// 		return (`User: '${user}' not found.`);
	// 	const	responseUser = await this.usersRepository.remove(tmpUser as User);
	// 	return (responseUser)
	// }

	// async	deleteFolder(filesFolder: string)
	// {
	// 	const uploadsPath = path.join(process.cwd(), filesFolder ? filesFolder: 'uploads');
	// 	if (!fs.existsSync(uploadsPath))
	// 		throw (new NotFoundException(`File path is not exist!: Path: ${uploadsPath}`));
	// 	const files = fs.readdirSync(uploadsPath);
	// 	if (files.length === 0)
	// 	{
	// 		console.warn(`There is no file for delete!: Folder: ${uploadsPath}`);
	// 		return (`There is no file for delete!: ${filesFolder}`);
	// 	}
	// 	for (const file of files) {
	// 		const filePath = path.join(uploadsPath, file);
	// 		fs.unlinkSync(filePath);
	// 		console.log(`File successfully deleted: ${filePath}`);
	// 	}
	// 	// if (!rimraf.sync(uploadsPath)) // Burada dosyanin kendisini sildigimizde; backend yeniden baslatilmazsa herhangi bir PUT islemindeyken hata veriyor. Bu yuzden klasoru silmiyoruz icerisindeki dosyalari siliyoruz.
	// 	// 	return (null);
	// 	console.log(`Folder inside successfully deleted! Folder: ${uploadsPath}`);
	// 	return (`Folder inside succesfully deleted!: ${filesFolder}`);
	// }

	// async	deleteFilesFromArray(files: string[])
	// {
	// 	for (const file of files) {
	// 		const filePath = path.join(process.cwd(), 'uploads', file);
	// 		if (!fs.existsSync(filePath))
	// 		{
	// 			console.warn(`File not found: ${filePath}`);
	// 			continue;
	// 		}
	// 		fs.unlinkSync(filePath);
	// 		console.log(`File successfully deleted: ${filePath}`);
	// 	}
	// 	return (`OK: ${files}`);
	// }

	// async	deleteFile(
	// 	file: string | string[]| undefined,
	// ){
	// 	// const filePath = path.join(process.cwd(), 'uploads', file);
	// 	// if (!fs.existsSync(filePath))
	// 	// 	throw (new Error(`File path is not valid: ${filePath}`));
	// 	// fs.unlinkSync(`./uploads/${file}`);
	// 	// console.log(`File successfully deleted. ✅: File Path: ${filePath}`);
	// 	// return (`File deleted successfully.`);

	// 	const responseDelete = (file === undefined)
	// 		? await this.deleteFolder('uploads')
	// 		: (Array.isArray(file) // file array[] ise bu array'deki dosyalar silinecek.
	// 			? await this.deleteFilesFromArray(file)
	// 			: (typeof(file) === 'string' // file array degilse sadece 1 tane string ise,
	// 				? await this.deleteFilesFromArray([`${file}`]) // Burada array[] gibi veriyoruz. Raad sikinti yok.
	// 				: null)); // Hicbiri de olmazssa artik sikinti var demek.
	// 	return (`Delete finish: Status: ${responseDelete}`);
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