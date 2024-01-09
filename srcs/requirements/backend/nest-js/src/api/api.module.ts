import { Module } from '@nestjs/common';
import { ApiService } from './api.service';
import { ApiController } from './api.controller';
import { UsersModule } from 'src/users/users.module'; // Bunu ekledik.
import { UsersService } from 'src/users/users.service';
import { UsersController } from 'src/users/users.controller';

@Module({
	imports: [UsersModule],
	controllers: [ApiController],
	providers: [ApiService],
})
export class ApiModule {}
