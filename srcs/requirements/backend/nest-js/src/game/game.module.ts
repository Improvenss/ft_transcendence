import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameController } from './game.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Game } from './entities/game.entity';
import { UsersModule } from 'src/users/users.module';

@Module({
	imports: [
		UsersModule,
		TypeOrmModule.forFeature([Game]),
	],
	controllers: [GameController],
	providers: [GameService],
	exports: [TypeOrmModule],
})
export class GameModule {}
