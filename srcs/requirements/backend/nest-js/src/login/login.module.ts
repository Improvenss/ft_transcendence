import { Module } from '@nestjs/common';
import { LoginController } from './login.controller';
import { ApiController } from './api/api.controller';

@Module({
	controllers: [LoginController, ApiController]
})
export class LoginModule {}
