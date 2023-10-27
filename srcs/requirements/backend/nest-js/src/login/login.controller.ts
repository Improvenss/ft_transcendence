import { Controller, Get, Post, Body, Req } from '@nestjs/common';

@Controller('login')
export class LoginController {
	@Get()
	getLogin() {
		return ("Here 'login' page.");
	}

	@Post()
	loginStatus(@Body() status: {requestLogin: string}) {
		const	URL = `https://api.intra.42.fr/oauth/authorize?client_id=${process.env.API_UID}&redirect_uri=${process.env.API_REDIR_URI}&response_type=code`;
		if (status.requestLogin === "LOGIN")
			return ({message: "Login Successfully!", requestLogin: URL});
		else
			return ({message: "Connection Failed!", requestLogin: process.env.API_LOGIN_URL});
	}
}
