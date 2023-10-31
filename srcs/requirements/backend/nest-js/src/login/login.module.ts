import { Module } from '@nestjs/common';
import { LoginController } from './login.controller';
import { ApiController } from './api/api.controller';
import UsersController from 'src/users/users.controller';
import { UsersModule } from 'src/users/users.module';

@Module({
	controllers: [LoginController, ApiController],
	imports: []
})
export class LoginModule {}
