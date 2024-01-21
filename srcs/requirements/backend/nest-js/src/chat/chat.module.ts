import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Channel, Dm, DmMessage, Message } from './entities/chat.entity';
import { ChatGateway } from './chat.gateway';
import { GameHistory, Notif, User } from 'src/users/entities/user.entity';
import { Game } from 'src/game/entities/game.entity';
import { GameService } from 'src/game/game.service';
import { UsersService } from 'src/users/users.service';
import { TwoFactorAuthService } from 'src/auth/2fa.service';

@Module({
	imports: [
		TypeOrmModule.forFeature([User, Channel, Message, Notif, Game, Dm, DmMessage, GameHistory]),
	], // Burasi da User CRUD'unu kullanabilmemizi sagliyor.
	controllers: [ChatController],
	providers: [UsersService, ChatService, ChatGateway, GameService, TwoFactorAuthService],
	exports: [TypeOrmModule, ChatGateway],
})
export class ChatModule {}