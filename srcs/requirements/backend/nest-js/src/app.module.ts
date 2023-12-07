import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatGateway } from './chat/chat.gateway'; // nest g gateway chat kodunu calistirdiktan sonra geldi.
// import 'dotenv/config'; // Ya da bunu ekleyecegiz hic ConfigModule.forRoot()'u kullanmayacagiz.
import { ConfigModule } from '@nestjs/config'; // Bunu ekledigimizde 'dotenv/config'i kullanmiyoruz. Ama ConfigModule.forRoot()'u eklemek zorunda kaliyoruz.
import { TypeOrmModule } from '@nestjs/typeorm'; // Veritabani ile iletisim kurabilmek icin kullandigimiz ORM kutuphanesi.
import { ApiModule } from './api/api.module';
import { UsersModule } from './users/users.module';
import { ChatModule } from './chat/chat.module';
import { ChatService } from './chat/chat.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
	imports: [
		// ConfigModule.forRoot({
		// 	envFilePath: '.env',
		// 	expandVariables: true,
		// }),
		JwtModule.register({
			global: true,
			secret: process.env.JWT_PASSWORD_HASH,
			// signOptions: {expiresIn: '1h'},
		}),
		TypeOrmModule.forRoot({
			type: 'postgres',
			port: parseInt(process.env.B_POSTGRES_PORT),
			host: process.env.B_POSTGRES_HOST,
			username: process.env.B_POSTGRES_USER,
			password: process.env.B_POSTGRES_PASSWORD,
			database: process.env.B_POSTGRES_DB,
			entities: [__dirname + '/**/*.entity{.ts,.js}'],
			synchronize: true,
		}),
		ApiModule,
		UsersModule,
		ChatModule,
	],
	controllers: [AppController],
	providers: [AppService, ChatGateway, ChatService], // Buraya da nest g gateway chat kodunu calistirinca geldi.
})
export class AppModule {}