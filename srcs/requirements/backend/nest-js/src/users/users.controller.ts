import { Body, Controller, Post, Delete, Param, NotFoundException, Get } from '@nestjs/common';
import UsersService from './users.service';
import User from './users.entity';

@Controller('users')
class UsersController {
	constructor( private readonly usersService: UsersService ) {}

	@Post()
	async	cCreateUser( @Body() user: User ): Promise<User> {
		return (this.usersService.createUser(user));
	}

	@Delete(':id')
	async	cDeleteUser( @Param('id') id: number ): Promise<any> {
		const	tmpUser = await this.usersService.getUser(id);
		if (!tmpUser)
			throw (new NotFoundException("Delete:id : User does not exist!")); // Eger 'user' olusturulamazsa exception atiyoruz.
		return (this.usersService.deleteUser(id)); // Service'deki kodu calistiriyoruz.
	}

	@Get()
	async	cGetAll(): Promise<User[]> {
		return (this.usersService.getAll());
	}

	@Get(':id')
	async	cGetUser( @Param('id') id: number): Promise<User> {
		const	tmpUser = await this.usersService.getUser(id);
		if (!tmpUser)
			throw (new NotFoundException("Get:id : User does not exist!"));
		return (tmpUser);
	}
}

export default UsersController;

/**
 * LINK: https://medium.com/@mohitu531/nestjs-7c0eb5655bde
 * Bu 'Controller'(Denetleyici) nedir ne icin kullanilir?
 * 
 * Nedir?: Backend'e gelen HTTP isteklerini isler.
 * 
 * Genellikle istekleri yonetir, istemciye yanitlar dondurur.
 *  
 */