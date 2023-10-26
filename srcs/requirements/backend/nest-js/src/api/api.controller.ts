import { Controller, Post, Body } from '@nestjs/common';

@Controller('api')
export class ApiController {
	@Post()
	aldik(@Body('key') code: string) {
		return ("Aldigimiz kod:" + code);
	}
}
