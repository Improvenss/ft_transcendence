import { Module } from '@nestjs/common';
// import { ChatGateway } from './chat.gateway';
import { UsersModule } from 'src/users/users.module';

@Module({
	imports: [UsersModule],
	// providers: [ChatGateway], // BAK BAK BU MAHLUKAT, AQ PROVIDERS'I 2 KERE CALISMASINI SAGLIYORMUS... 2 HAFTADIR BUNUNLA UGRASIYORUZ AQ.
})
export class ChatModule {}
