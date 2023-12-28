import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameController } from './game.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Game } from './entities/game.entity';
import { UsersModule } from 'src/users/users.module';
import { User } from 'src/users/entities/user.entity';
import { ChatService } from 'src/chat/chat.service';
import { ChatModule } from 'src/chat/chat.module';
import { ChatGateway } from 'src/chat/chat.gateway';

@Module({
	imports: [
		// UsersModule,
		// ChatModule,
		// GameModule,
		TypeOrmModule.forFeature([Game, User]),
	],
	controllers: [GameController],
	providers: [ChatService, GameService],
	exports: [TypeOrmModule],
})
export class GameModule {}
