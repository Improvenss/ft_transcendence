import { Controller, Post, Body, Get, Param } from '@nestjs/common';

@Controller('api')
export class ApiController {
	@Post()
	async firstCode(@Body() code: string)
	{
		const	form = new FormData();

		form.append('grant_type', 'authorization_code');
		form.append('client_id', process.env.API_UID as string);
		form.append('client_secret', process.env.API_SECRET as string);
		form.append('code', code as string);
		form.append('redirect_uri', process.env.API_REDIR_URI as string);
		const	responseToken = await fetch(process.env.API_TOKEN_URL as string, {
			method: 'POST',
			headers: {
				'Access-Control-Allow-Origin': '*'
			},
			body: form
		});
		const data = await responseToken.json();
		console.log(responseToken);
		return ("Aldigimiz kod:" + code);
	};

	// @Post()
	// create(@Body() code: CreateLoginDto) { //Json olarak gelen argümana bakıyor
	// 	return { message: "User code received", code: code.code };
	// 	//return (`User code: ${code.code}`);
	// 	// http://localhost:3000/login?code=asdadad
	// 	// network kısmındaki json dosyasını kontrol et
	// };


	@Get(":uri") //localhost:3000/login/asdadsasd   uri=asdadsasd
	getUri(@Param("uri") user_uri) {
		return `This id ${user_uri}.`;
	}
};
