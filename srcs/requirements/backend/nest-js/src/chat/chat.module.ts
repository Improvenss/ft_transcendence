import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { UsersModule } from 'src/users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Channel, Dm, DmMessage, Message } from './entities/chat.entity';
import { ChatGateway } from './chat.gateway';
import { Notif, User } from 'src/users/entities/user.entity';
import { Game } from 'src/game/entities/game.entity';
import { GameService } from 'src/game/game.service';
import { UsersService } from 'src/users/users.service';

@Module({
	imports: [
		TypeOrmModule.forFeature([User, Channel, Message, Notif, Game, Dm, DmMessage]),
	], // Burasi da User CRUD'unu kullanabilmemizi sagliyor.
	controllers: [ChatController],
	providers: [UsersService, ChatService, ChatGateway, GameService],
	exports: [TypeOrmModule, ChatGateway],
})
export class ChatModule {}