import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException, HttpException, HttpStatus, ConsoleLogger, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from 'src/auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('users')
export class UsersController {
	constructor(
		private readonly usersService: UsersService,
		private readonly jwtService: JwtService,
	) {}

	/**
	 * Yeni bir 'User'i DB'ye kaydediyoruz.
	 * @param createUserDto 
	 * @returns 
	 */
	@Post()
	async	create(@Body() createUserDto: CreateUserDto) {
		const	newUser = await this.usersService.create(createUserDto);
		if (!newUser)
			throw (new HttpException("@Post(): create(): User could not be created!",
				HttpStatus.INTERNAL_SERVER_ERROR));
		return (newUser);
	}

	@Post('socket')
	async	createSocket(
		@Req() {user},
		@Body() status: {socketID: string}) {
		try {
			console.log("POST socket:", status);
			const	tmpUser = await this.usersService.updateSocketLogin(user.login as string, status.socketID);
			return ({message: `Socket updated successfully. login[${tmpUser.login}], socket.id[${tmpUser.socketId}]`});
		} catch(err) {
			console.error("@Post('socket'): ", err);
			return ({message: "Socket not updated."});
		}
	}

	@Get('cookie')
	async userCookie(
		@Req() {user},
	){
		try
		{
			if (!user)
				throw (new Error("Cookie not provided"));
			console.log("GUARD'dan gelen decoded edilmis user:", user);
			return ({message: "COOKIE OK"});
		}
		catch(err)
		{
			console.error("Cookie err:", err);
			return ({message: "COOKIE NOK"});
		}
	}

	@Get('user')
	async createUser(
		@Req() {user}
	){
		try {
			const tmpUser = await this.usersService.findOne(null, user.login, ['channels']);
			if (!tmpUser)
				throw (new NotFoundException("@Get('user'): findOne(): User does not exist!"));
			return ({message: "USER OK", user: tmpUser});
		} catch(err){
			console.error("@Get('user'): ", err);
			return ({message: "USER NOK"});
		}
	}

	/**
	 * DB'den butun 'User' verilerini donduruyoruz.
	 * @returns All Users.
	 */
	@Get()
	findAll() {
		return this.usersService.findAll();
	}

	/**
	 * Verilen id'nin ya da login'in karsilik
	 *  geldigi 'User' verisini donduruyoruz.
	 * @param id Istenilen 'user'in 'id'si.  * @param login Istenilen 'user'in login'i.
	 * @returns 'user'.
	 */
	// @Get(':id/:login?')
	@Get(':id(\\d+)')
	async findOneId(@Param('id') id: string) {
		const tmpUser = await this.usersService.findOne(+id, undefined);
		if (!tmpUser)
			throw (new NotFoundException("@Get(':id'): findOneId(): User does not exist!"));
		return (tmpUser);
	}

	/**
	 * Verilen login'in karsilik geldigi 'User' verisini donduruyoruz.
	 * @param login Istenilen 'user'in login'i.
	 * @returns 'user'.
	 */
	@Get(':login')
	async findOneLogin(@Param('login') login: string) {
		const tmpUser = await this.usersService.findOne(undefined, login);
		if (!tmpUser)
			throw (new NotFoundException("@Get(':login'): findOne(): User does not exist!"));
		return (tmpUser);
	}

	/**
	 * DB'de var olan User verisini guncellemek icin.
	 * @param id 
	 * @param updateUserDto 
	 * @returns 
	 */
	@Patch(':id(\\d+)')
	async	update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
		const	tmpDb: UpdateUserDto = {}; // DB'deki guncellenmis degerler atanacak.
		const	tmpUser = await this.usersService.update(+id, updateUserDto); // DB'deki eskisi yenisiyle guncelliyoruz, yeni halini donduruyoruz.
		if (!tmpUser)
			throw (new HttpException("@Patch(':id'): update(): id: User does not exist!",
				HttpStatus.INTERNAL_SERVER_ERROR));
		// Bizim guncellemek icin attigimiz istekteki parametreleri DB'deki ile karsilastiriyoruz.
		// Eger ikisinde de varsa; tmpDb'ye atiyoruz.
		// Degismis mi degismemis mi DB'deki veriyi aliyoruz.
		// DB'deki veriyle, bizim istedigimizi karsilastiracagiz.
		// Degerler ayniysa basarili bir sekilde 'update' tamamlanmis oluyor.
		for (const key in updateUserDto)
			if (updateUserDto.hasOwnProperty(key) && tmpUser.hasOwnProperty(key))
				tmpDb[key] = tmpUser[key];
		// Burada JSON dosyasinin icerisindeki verileri parse'ledik.
		const updateUserObj = JSON.parse(JSON.stringify(updateUserDto));
		// const tmpUserObj = JSON.parse(JSON.stringify(tmpUser));
		const tmpDbObj = JSON.parse(JSON.stringify(tmpDb));
		console.log("-------------------");
		console.log("tmpDb -> :", tmpDb);
		// console.log(updateUserDto);
		// console.log(tmpUser);
		console.log("-------------------");
		console.log("updateUserObj -> :", updateUserObj);
		console.log("+++++++++++");
		console.log("tmpDbObj -> :", tmpDbObj);
		console.log("-------------------");
		// Burada da duzgunce alinmis JSON dosyasi uzerinden esitlik kontrolu yapiyoruz.
		if (JSON.stringify(updateUserObj) !== JSON.stringify(tmpDbObj))
			throw (new HttpException("@Patch(':id'): update(): id: User's in DB but User does not update!",
				HttpStatus.INTERNAL_SERVER_ERROR));
		return ({message: "User updated successfully."});
	}

	@Patch(':login')
	async	updateSocketLogin(@Param('login') login: string,
	@Body() socketData: string) {
		const	tmpUser = await this.usersService.updateSocketLogin(login, socketData);
		if (!tmpUser)
			throw (new HttpException("@Patch(':login'): update(): id: User does not exist!",
				HttpStatus.INTERNAL_SERVER_ERROR));
		return ({message: "User socket_id updated."});
	}

	@Delete()
	async	removeAll() {
		return this.usersService.removeAll();
	}

	/**
	 * Disaridan 'string' olarak aldigimiz 'id' parametremizi
	 *  Number() ile 'number' tipine ceviriyoruz.
	 * @param id String
	 * @returns 
	 */
	@Delete(':id')
	async	remove(@Param('id') id: string) {
		const	tmpUser = await this.usersService.findOne(Number(id));
		if (!tmpUser)
			throw (new NotFoundException("@Delete(':id'): remove(): id : User does not exist!")); // Eger 'user' olusturulamazsa exception atiyoruz.
		return this.usersService.remove(+id);
	}
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