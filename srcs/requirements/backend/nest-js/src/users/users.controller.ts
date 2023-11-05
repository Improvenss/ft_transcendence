import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException, HttpException, HttpStatus, ConsoleLogger } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
// import { isEqual } from 'lodash';

@Controller('users')
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

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

	/**
	 * DB'den butun 'User' verilerini donduruyoruz.
	 * @returns All Users.
	 */
	@Get()
	findAll() {
		return this.usersService.findAll();
	}

	/**
	 * Verilen id'nin karsilik geldigi 'User' verisini donduruyoruz.
	 * @param id Istenilen 'user'in 'id'si.
	 * @returns 'user'.
	 */
	@Get(':id')
	async	findOne(@Param('id') id: string) {
		// const	tmpUser = this.usersService.findOne(Number(id));
		const	tmpUser = await this.usersService.findOne(+id);
		if (!tmpUser)
			throw (new NotFoundException("@Get(':id'): findOne(): id: User does not exist!"));
		return (tmpUser);
	}

	/**
	 * DB'de var olan User verisini guncellemek icin.
	 * @param id 
	 * @param updateUserDto 
	 * @returns 
	 */
	@Patch(':id')
	async	update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
		const	tmpUser = await this.usersService.update(+id, updateUserDto);
		if (!tmpUser)
			throw (new HttpException("@Patch(':id'): update(): id: User does not exist!",
				HttpStatus.INTERNAL_SERVER_ERROR));
		// if (updateUserDto !== tmpUser)
		// if (!isEqual(updateUserDto, tmpUser)) // Buradaki function 'lodash' kutuphanesi icerisindeki objenin tipini ve icerisindeki degerlerini de esit mi diye kontrol ediyor.
		// if (JSON.stringify(UpdateUserDto) !== JSON.stringify(tmpUser))
			// throw (new HttpException("@Patch(':id'): update(): id: User's in DB but User does not update!",
				// HttpStatus.INTERNAL_SERVER_ERROR));
		return ({message: "User updated successfully."});
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