import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoginModule } from './login/login.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users/users.controller';
// import UserService from './users/users.service';
import { UsersModule } from './users/users.module';
import 'dotenv/config'; // <- this line is the important

@Module({
	imports: [
		LoginModule,
		TypeOrmModule.forRoot({
			type: 'postgres',
			port: parseInt(process.env.POSTGRES_PORT),
			host: process.env.POSTGRES_HOST,
			username: process.env.POSTGRES_USER,
			password: process.env.POSTGRES_PASSWORD,
			database: process.env.POSTGRES_DB,
			entities: [],
			synchronize: true, //false for production, else destroy/recreate data in the db
		}),
		UsersModule,
	],
	controllers: [AppController, UsersController],
	providers: [AppService],
})
export class AppModule {}

