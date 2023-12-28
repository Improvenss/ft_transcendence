import { Module } from '@nestjs/common';
import { ApiService } from './api.service';
import { ApiController } from './api.controller';
import { UsersModule } from 'src/users/users.module'; // Bunu ekledik.
import { UsersService } from 'src/users/users.service';

@Module({
	imports: [
		UsersModule
	], // users.module.ts dosyasindan export ettigimizi burada import edecegiz ki kullanabilelim.
	controllers: [ApiController],
	providers: [ApiService],
})
export class ApiModule {}
