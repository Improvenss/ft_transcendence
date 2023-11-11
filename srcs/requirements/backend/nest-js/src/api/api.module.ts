import { Module } from '@nestjs/common';
import { ApiService } from './api.service';
import { ApiController } from './api.controller';
import { UsersModule } from 'src/users/users.module'; // Bunu ekledik.

@Module({
	imports: [UsersModule], // users.module.ts dosyasindan export ettigimizi burada import edecegiz ki kullanabilelim.
	controllers: [ApiController],
	providers: [ApiService],
})
export class ApiModule {}
