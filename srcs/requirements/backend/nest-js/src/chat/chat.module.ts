import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { UsersModule } from 'src/users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Channel, Message } from './entities/chat.entity';
import { ChatGateway } from './chat.gateway';

@Module({
	imports: [
		UsersModule,
		TypeOrmModule.forFeature([Channel, Message]),
	], // Burasi da User CRUD'unu kullanabilmemizi sagliyor.
	controllers: [ChatController],
	providers: [ChatService, ChatGateway],
	exports: [TypeOrmModule], // <-- TypeOrmModule'ü ihraç edin
})
export class ChatModule {}