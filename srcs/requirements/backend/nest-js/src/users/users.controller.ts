import { Controller, Get, Post, Body, Patch, Delete, NotFoundException, Req, UseGuards, Query, Put, UploadedFile, UseInterceptors } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/create-user.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { Socket } from 'socket.io';
import { Colors as C } from 'src/colors';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from 'src/chat/channel.handler';
import { promisify } from 'util';
import * as fs from 'fs';
import { ChatGateway } from 'src/chat/chat.gateway';
import { Notif } from './entities/user.entity';

@UseGuards(AuthGuard)
@Controller('/users')
export class UsersController {
	constructor(
		private readonly usersService: UsersService,
		private readonly chatGateway: ChatGateway,
	) {}

	@Get('/user')
	async getUser(
		@Req() {user},
		@Query ('user') findUser: string | 'me' | undefined,
		@Query ('socket') findSocket?: Socket | undefined,
		@Query('relations') relations?: string[] | null | 'all',
	){
		try
		{
			console.log(`${C.B_GREEN}GET: /user: @Query('user'): [${findUser}], @Query('socket'): [${findSocket}], @Query('relations'): [${relations}]${C.END}`);
			const	tmpUser = await this.usersService.findUser(
				(findUser === 'me') ? user.login : findUser,
				findSocket,
				relations
			);
			if (!tmpUser)
				return ({message: "USER NOK", user: `User '${findUser}' not found.`});
			return ({message: "USER OK", user: tmpUser});
		}
		catch (err)
		{
			console.log("@Get('/user'): ", err);
			return ({err: err});
		}
	}

	// OK
	@Get('/cookie')
	async userCookie(
		@Req() {user},
	){
		try
		{
			if (!user)
				throw (new Error("Cookie not provided"));
			return ({message: `user[${user.login}] cookie is ✅`});
		}
		catch(err)
		{
			console.error("Cookie err:", err);
			return ({message: `user[${user.login}] cookie is ❌`, err: err.message});
		}
	}

	// @Post('/create')
	// async	createUser(
	// 	@Body() createUserDto: CreateUserDto,
	// ){
	// 	const	newUser = await this.usersService.createUser(createUserDto);
	// 	if (!newUser)
	// 		throw (new HttpException("@Post(): create(): User could not be created!",
	// 			HttpStatus.INTERNAL_SERVER_ERROR));
	// 	return (newUser);
	// }

	// OK
	@Patch('/socket')
	async	patchSocket(
		@Req() {user},
		@Body() status: {socketId: string}
	){
		try
		{
			const	tmpUser = await this.usersService.updateSocketLogin(user.login, status.socketId);
			if (!tmpUser)
				throw (new NotFoundException(`User ${user.login} not found.`));
			return ({message: `Socket updated successfully. login[${tmpUser.login}], socket.id[${tmpUser.socketId}]`});
		} catch(err) {
			console.error("@Patch('/socket'): ", err);
			return ({message: "Socket not updated."});
		}
	}

	// @Patch('/:login')
	// async	patchSocketLogin(
	// 	@Param('login') login: string,
	// 	@Body() socketData: string
	// ){
	// 	const	tmpUser = await this.usersService.updateSocketLogin(login, socketData);
	// 	if (!tmpUser)
	// 		throw (new HttpException("@Patch(':login'): update(): id: User does not exist!",
	// 			HttpStatus.INTERNAL_SERVER_ERROR));
	// 	return ({message: "User socket_id updated."});
	// }

	@Put('/user/upload')
	@UseInterceptors(FileInterceptor('image', multerConfig))
	async	putFile(
		@Req() {user},
		@UploadedFile() image: any,
	){
		try
		{
			console.log(`${C.B_BLUE}PUT: /user/upload: @UploadedFile(): ${C.END}`, image);
			if (!image)
				throw (new Error(`File not found!: File Name:${image.filename}`));
			const imgUrl =  process.env.B_IMAGE_REPO + image.filename;
			if (!fs.existsSync(image.path))
				throw (new Error(`File path is not valid. ${image.path}`));
			return ({imgUrl});
		}
		catch (err)
		{
			if (image) {
				try {
					await promisify(fs.promises.unlink)(image.path);
					console.log(`File successfully deleted. ✅: image.path: ${image.path}`);
				} catch (unlinkErr) {
					console.error('Error occurred while deleting file.:', unlinkErr);
				}
			}
			console.error("@Put('/user/upload'): ", err);
			return ({ message: "Image can't uploaded.", err});
		}
	}

	// OK
	@Patch('/user')
	async	patchUser(
		@Req() {user},
		@Query('user') findUser: string | undefined,
		@Body() body: Partial<UpdateUserDto>,
	){
		try
		{
			// console.log(`${C.B_PURPLE}PATCH: /user: @Query('user'): [${user.login}] @Body(): [${body}]${C.END}`);
			console.log(`${C.B_PURPLE}PATCH: /user: @Query('user'): [${findUser}] @Body():${C.END}`, body); // sonra yapilacak
			// const	responseUser = await this.usersService.patchUser(user.login, body);
			const	responseUser = await this.usersService.patchUser(findUser, body);
			return (responseUser);
		}
		catch (err)
		{
			console.log("@Patch('/user'): ", err);
			return ({err: err});
		}
	}

	// OK
	@Delete('/user')
	async	deleteUser(
		@Req() {user},
		@Query('user') delUser: string | undefined,
	){
		try
		{
			console.log(`${C.B_RED}DELETE: /user: @Query('user'): [${delUser}]${C.END}`);
			const	responseUser = await this.usersService.deleteUser(delUser);
			return (responseUser);
		}
		catch (err)
		{
			console.error("@Delete('/user'): ", err);
			return ({err: err});
		}
	}

	@Delete('/file/delete')
	async deleteImage(
		@Req() {user},
		@Query('file') file: string | string[] | undefined,
	){
		try
		{
			console.log(`${C.B_RED}DELETE: /user/delete: @Query('file'): [${file}]${C.END}`);
			const	responseDeleteFile = await this.usersService.deleteFile(file)
			if (!responseDeleteFile)
				throw (new Error('Error deleting file:'));
			return (responseDeleteFile);
		}
		catch (err)
		{
			console.error("@Delete('/file/delete'): ", err);
			return ({message: `Failed to delete file.: Error: ${err}`});
		}
	}

	@Post()
	async request(
		@Req() {user},
		@Query('action') action: 'poke' | 'sendFriendRequest' | 'acceptFriendRequest' | 'declineFriendRequest' | 'unFriend',
		@Query('target') target: string | undefined,
		@Query('id') requestId?: number,
	){
		try {
			console.log(`${C.B_YELLOW}POST: /user: @Req() action: [${action}] target: [${target}] notifId: [${requestId}]${C.END}`);
			if (action === undefined || target === undefined)
				throw Error(`Query is empty!`);
			if (requestId)
				await this.usersService.deleteNotif(user.id, requestId);

			let result : Notif;

			if (action === 'poke')
				result = await this.usersService.createNotif(user.login, target, 'text', `${user.displayname} poked you!`);
			else if (action === 'sendFriendRequest' ||
					action === 'acceptFriendRequest' ||
					action === 'declineFriendRequest')
				result = await this.usersService.friendRequest(action, user, target);
			else
				throw new Error('Invalid action values!');

			this.chatGateway.server.emit(`notif:${target}`, result);
			return ({message: `${action} was successfully performed on user[${target}].`});
		} catch (err) {
			console.error("@Post(): ", err);
			return ({err: err.message});
		}
	}

	/*
		process.env.REACT_APP_FETCH + `/users` ise istek atan kullanıcıya ait default veriler dönecektir.
		process.env.REACT_APP_FETCH + `/users?relation=notifications` ise kullanıcıya ait sadece notif verileri dönecektir.
		process.env.REACT_APP_FETCH + `/users?relation=notifications&user=true` ise kullanıcıyı ait bilgilerle notif dönecektir
	*/
	@Get()
	async getData(
		@Req() {user},
		@Query('relation') relation: string[] | string | undefined,
		@Query('primary') primary: 'true' | undefined,
	){
		try {
			console.log(`${C.B_YELLOW}GET: /user: @Req() relation: [${relation}] userData: [${primary}]${C.END}`);
			return (await this.usersService.getData({userLogin: user.login}, relation, primary));
		} catch (err) {
			console.error("@Get(): ", err);
			return ({err: err.message});
		}
	}


	// @Delete()
	// async	removeAll() {
	// 	return this.usersService.removeAll();
	// }


	// /**
	//  * DB'den butun 'User' verilerini donduruyoruz.
	//  * @returns All Users.
	//  */
	// @Get()
	// findAll() {
	// 	return this.usersService.findAll();
	// }

	// /**
	//  * Verilen id'nin ya da login'in karsilik
	//  *  geldigi 'User' verisini donduruyoruz.
	//  * @param id Istenilen 'user'in 'id'si.  * @param login Istenilen 'user'in login'i.
	//  * @returns 'user'.
	//  */
	// // @Get(':id/:login?')
	// @Get('/:id(\\d+)')
	// async findOneId(@Param('id') id: string) {
	// 	const tmpUser = await this.usersService.findOne(+id, undefined);
	// 	if (!tmpUser)
	// 		throw (new NotFoundException("@Get(':id'): findOneId(): User does not exist!"));
	// 	return (tmpUser);
	// }

	// /**
	//  * Verilen login'in karsilik geldigi 'User' verisini donduruyoruz.
	//  * @param login Istenilen 'user'in login'i.
	//  * @returns 'user'.
	//  */
	// @Get('/:login')
	// async findOneLogin(@Param('login') login: string) {
	// 	const tmpUser = await this.usersService.findOne(undefined, login);
	// 	if (!tmpUser)
	// 		throw (new NotFoundException("@Get(':login'): findOne(): User does not exist!"));
	// 	return (tmpUser);
	// }

	// /**
	//  * DB'de var olan User verisini guncellemek icin.
	//  * @param id 
	//  * @param updateUserDto 
	//  * @returns 
	//  */
	// @Patch('/:id(\\d+)')
	// async	update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
	// 	const	tmpDb: UpdateUserDto = {}; // DB'deki guncellenmis degerler atanacak.
	// 	const	tmpUser = await this.usersService.update(+id, updateUserDto); // DB'deki eskisi yenisiyle guncelliyoruz, yeni halini donduruyoruz.
	// 	if (!tmpUser)
	// 		throw (new HttpException("@Patch(':id'): update(): id: User does not exist!",
	// 			HttpStatus.INTERNAL_SERVER_ERROR));
	// 	// Bizim guncellemek icin attigimiz istekteki parametreleri DB'deki ile karsilastiriyoruz.
	// 	// Eger ikisinde de varsa; tmpDb'ye atiyoruz.
	// 	// Degismis mi degismemis mi DB'deki veriyi aliyoruz.
	// 	// DB'deki veriyle, bizim istedigimizi karsilastiracagiz.
	// 	// Degerler ayniysa basarili bir sekilde 'update' tamamlanmis oluyor.
	// 	for (const key in updateUserDto)
	// 		if (updateUserDto.hasOwnProperty(key) && tmpUser.hasOwnProperty(key))
	// 			tmpDb[key] = tmpUser[key];
	// 	// Burada JSON dosyasinin icerisindeki verileri parse'ledik.
	// 	const updateUserObj = JSON.parse(JSON.stringify(updateUserDto));
	// 	// const tmpUserObj = JSON.parse(JSON.stringify(tmpUser));
	// 	const tmpDbObj = JSON.parse(JSON.stringify(tmpDb));
	// 	console.log("-------------------");
	// 	console.log("tmpDb -> :", tmpDb);
	// 	// console.log(updateUserDto);
	// 	// console.log(tmpUser);
	// 	console.log("-------------------");
	// 	console.log("updateUserObj -> :", updateUserObj);
	// 	console.log("+++++++++++");
	// 	console.log("tmpDbObj -> :", tmpDbObj);
	// 	console.log("-------------------");
	// 	// Burada da duzgunce alinmis JSON dosyasi uzerinden esitlik kontrolu yapiyoruz.
	// 	if (JSON.stringify(updateUserObj) !== JSON.stringify(tmpDbObj))
	// 		throw (new HttpException("@Patch(':id'): update(): id: User's in DB but User does not update!",
	// 			HttpStatus.INTERNAL_SERVER_ERROR));
	// 	return ({message: "User updated successfully."});
	// }

	// @Delete()
	// async	deleteUser(
	// 	@Req() {user},
	// 	@Query('user') quser: string | undefined,
	// ){
	// 	try
	// 	{
	// 		console.log(`${C.B_RED}DELETE: @Query('user'): [${quser}]${C.END}`);
	// 		const	responseGameuser = await this.usersService.deleteUser(quser);
	// 		return (responseGameuser);
	// 	}
	// 	catch (err)
	// 	{
	// 		console.log("@Delete(): ", err);
	// 		return ({err: err});
	// 	}
	// }

	// /**
	//  * Disaridan 'string' olarak aldigimiz 'id' parametremizi
	//  *  Number() ile 'number' tipine ceviriyoruz.
	//  * @param id String
	//  * @returns 
	//  */
	// @Delete('/:id')
	// async	remove(@Param('id') id: string) {
	// 	const	tmpUser = await this.usersService.findOne(Number(id));
	// 	if (!tmpUser)
	// 		throw (new NotFoundException("@Delete(':id'): remove(): id : User does not exist!")); // Eger 'user' olusturulamazsa exception atiyoruz.
	// 	return this.usersService.remove(+id);
	// }
}

/**
 * LINK: https://medium.com/@mohitu531/nestjs-7c0eb5655bde
 * Bu 'Controller'(Denetleyici) nedir ne icin kullanilir?
 * 
 * Nedir?: Backend'e gelen HTTP isteklerini isler.
 * 
 * Genellikle istekleri yonetir, istemciye yanitlar dondurur.
 *  
 */