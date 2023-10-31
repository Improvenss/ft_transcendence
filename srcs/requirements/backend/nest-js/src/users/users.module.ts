import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import User from './users.entity';
import UsersController from './users.controller';
import UsersService from './users.service';

@Module({
	imports: [TypeOrmModule.forFeature([User])],
	controllers: [UsersController],
	providers: [UsersService]
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