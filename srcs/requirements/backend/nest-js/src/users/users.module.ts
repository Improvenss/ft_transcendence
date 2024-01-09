import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notif, User } from './entities/user.entity';
import { ChatModule } from 'src/chat/chat.module';

@Module({
	imports: [
		ChatModule,
		TypeOrmModule.forFeature([User, Notif]),
	], // Burasi da User CRUD'unu kullanabilmemizi sagliyor.
	controllers: [UsersController],
	providers: [UsersService],
	exports: [UsersService] // api.service.ts dosyasinin icerisinde kullandigimiz icin bunu export ediyoruz. Sonra da api.module.ts dosyasinda da import edecegiz.
})
export class UsersModule {}

/**
 * LINK: https://medium.com/@mohitu531/nestjs-7c0eb5655bde
 * Bu 'Module'(Modul) nedir ne icin kullanilir?
 * 
 * Nedir?: Uygulamamizin daha kucuk ve yonetilebilinir olmasini saglar.
 * 
 * Uygulamamizi baslattigimizda calistirilan ilk dosyadir. Burada,
 *  uygulamamiz icin gerekli dosyalari ekleriz.
 */