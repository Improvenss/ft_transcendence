import { Module } from '@nestjs/common';
import { ApiService } from './api.service';
import { ApiController } from './api.controller';
import { UsersModule } from 'src/users/users.module';

@Module({
	imports: [UsersModule],
	controllers: [ApiController],
	providers: [ApiService],
})
export class ApiModule {}
