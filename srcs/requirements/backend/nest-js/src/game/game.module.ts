import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameController } from './game.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Game } from './entities/game.entity';
import { UsersModule } from 'src/users/users.module';
import { User } from 'src/users/entities/user.entity';

@Module({
	imports: [
		UsersModule,
		TypeOrmModule.forFeature([Game, User]),
	],
	controllers: [GameController],
	providers: [GameService],
	exports: [TypeOrmModule],
})
export class GameModule {}
