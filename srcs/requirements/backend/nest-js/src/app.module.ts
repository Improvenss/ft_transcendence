import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
// import 'dotenv/config'; // Ya da bunu ekleyecegiz hic ConfigModule.forRoot()'u kullanmayacagiz.
import { ConfigModule } from '@nestjs/config'; // Bunu ekledigimizde 'dotenv/config'i kullanmiyoruz. Ama ConfigModule.forRoot()'u eklemek zorunda kaliyoruz.
import { TypeOrmModule } from '@nestjs/typeorm'; // Veritabani ile iletisim kurabilmek icin kullandigimiz ORM kutuphanesi.

@Module({
	imports: [
		ConfigModule.forRoot(),
		TypeOrmModule.forRoot({
			type: 'postgres',
			port: parseInt(process.env.POSTGRES_PORT),
			host: process.env.POSTGRES_HOST,
			username: process.env.POSTGRES_USER,
			password: process.env.POSTGRES_PASSWORD,
			database: process.env.POSTGRES_DB,
			entities: [__dirname + '/**/*.entity{.ts,.js}'],
			synchronize: true,
		}),
		// TypeOrmModule.forRoot({
		// 	type: 'postgres',
		// 	port: parseInt("5432"),
		// 	host: "postgres",
		// 	username: "transcendence",
		// 	password: "pass123",
		// 	database: "postgres",
		// 	entities: [__dirname + '/**/*.entity{.ts,.js}'],
		// 	synchronize: true,
		// }),
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}