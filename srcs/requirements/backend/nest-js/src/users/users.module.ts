import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notif, User } from './entities/user.entity';
import { ChatModule } from 'src/chat/chat.module';
import { TwoFactorAuthService } from 'src/auth/2fa.service';

@Module({
	imports: [
		ChatModule,
		TypeOrmModule.forFeature([User, Notif]),
	],
	controllers: [UsersController],
	providers: [UsersService, TwoFactorAuthService],
	exports: [UsersService]
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