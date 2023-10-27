import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { CreateApiDto } from "./dto/create-api.dto";

@Controller('api')
export class ApiController {

	@Get()
	getApi() {
		return ("API PAGE!");
	}

	@Post()
	create(@Body() code: CreateApiDto) {

		//async firstCode()
		//{
		//	const	form = new FormData();
	
		//	form.append('grant_type', 'authorization_code');
		//	form.append('client_id', process.env.API_UID as string);
		//	form.append('client_secret', process.env.API_SECRET as string);
		//	form.append('code', code as string);
		//	form.append('redirect_uri', process.env.API_REDIR_URI as string);
		//	const	responseToken = await fetch(process.env.API_TOKEN_URL as string, {
		//		method: 'POST',
		//		headers: {
		//			'Access-Control-Allow-Origin': '*'
		//		},
		//		body: form
		//	});
		//	const data = await responseToken.json();
		//	console.log(responseToken);
		return { message: "User code received", code: code.code };
		//};
	}
};
