import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { UsersModule } from 'src/users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Channel, Message } from './entities/chat.entity';
import { ChatGateway } from './chat.gateway';
import { User } from 'src/users/entities/user.entity';

@Module({
	imports: [
		UsersModule,
		TypeOrmModule.forFeature([User, Channel, Message]),
	], // Burasi da User CRUD'unu kullanabilmemizi sagliyor.
	controllers: [ChatController],
	providers: [ChatService, ChatGateway],
	exports: [TypeOrmModule, ChatGateway], // <-- TypeOrmModule'ü ihraç edin
})
export class ChatModule {}