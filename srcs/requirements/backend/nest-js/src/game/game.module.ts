import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameController } from './game.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Game } from './entities/game.entity';
import { UsersModule } from 'src/users/users.module';
import { User } from 'src/users/entities/user.entity';
import { ChatService } from 'src/chat/chat.service';
import { ChatModule } from 'src/chat/chat.module';
import { GameGateway } from './game.gateway';
import { UsersService } from 'src/users/users.service';
import { TwoFactorAuthService } from 'src/auth/2fa.service';

@Module({
	imports: [
		UsersModule,
		ChatModule,
		TypeOrmModule.forFeature([Game, User]),
	],
	controllers: [GameController],
	providers: [GameGateway, GameService, UsersService, ChatService, TwoFactorAuthService],
	exports: [GameService],
})
export class GameModule {}
