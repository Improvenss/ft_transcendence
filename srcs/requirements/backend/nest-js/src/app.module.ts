import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoginModule } from './login/login.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
// import 'dotenv/config'; // Ya da bunu ekleyecegiz hic ConfigModule.forRoot()'u kullanmayacagiz.
import { ConfigModule } from '@nestjs/config'; // Bunu ekledigimizde 'dotenv/config'i kullanmiyoruz. Ama ConfigModule.forRoot()'u eklemek zorunda kaliyoruz.

@Module({
	imports: [
		ConfigModule.forRoot(), // Burada ya bunu ekleyecegiz 'dotenv/config' i kaldiracagiz.
		UsersModule,
		LoginModule,
		TypeOrmModule.forRoot({
			type: 'postgres',
			port: parseInt(process.env.POSTGRES_PORT),
			host: process.env.POSTGRES_HOST,
			username: process.env.POSTGRES_USER,
			password: process.env.POSTGRES_PASSWORD,
			database: process.env.POSTGRES_DB,
			entities: [__dirname + '/**/*.entity{.ts,.js}'],
			synchronize: true,
		})
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}

