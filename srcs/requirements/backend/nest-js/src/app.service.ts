import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
	getHello(): string {
		return ('Hello World! from backend/nest-js/src/app.service.ts');
	}
}
