import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ApiService } from './api.service';
import * as fs from 'fs';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('api')
export class ApiController {
	constructor(
		private readonly apiService: ApiService,
		private readonly jwtService: JwtService,
	) {}

	/**
	 * React'tan ilk butona tikandigi anda buraya geliyor.
	 * @param status 
	 * @returns API ekraninin linki; Authorization ekrani gelecek.
	 */
	@Post('login')
	async	loginStatus(@Body() status: {requestLogin: string}) {
		const	URL = `https://api.intra.42.fr/oauth/authorize?client_id=\
${process.env.API_UID}&redirect_uri=\
${process.env.API_REDIR_URI}&response_type=code`;
		if (status.requestLogin === "LOGIN") // Basarili bir sekilde giris yapabilir.
			return ({message: "Login Successfully!", requestLogin: URL});
		else // Buradaki requestLogin kismini login ya da 404 sayfasi yapabilirsin.
			return ({message: "Connection Failed!", requestLogin: process.env.API_LOGIN_URL});
	}

	/**
	 * 2/3 & 3/3 adimlar burada gerceklesiyor.
	 * Buradaki islemler bittigi anda 42 API'den user'in butun
	 *  bilgileri alinmis olacak.
	 * @param status 
	 * @returns 
	 */
	@Post('token')
	async	loginToken(@Body() status: {code: string}) {
		// Burada 2/3 access_token'i aliyoruz
		const	response = await this.apiService.fetchToken(status);
		if (!response.ok)
			return {message: "BACKEND response NOK"};
		const	dataToken = await response.json();

		// Burada 3/3 user(dataClient) verisini aliyoruz.
		const	responseAccessToken = await this.apiService.fetchAccessToken(dataToken);
		if (!responseAccessToken.ok)
			return {message: "BACKEND responseAccessToken NOK"};
		const	dataClient = await responseAccessToken.json(); // User data (json file).

		// 42 API'sinden alinan butun veriyi dosyaya kaydet.(opsiyonel)
		const path = require('path');
		const filename = "me_data.json";
		const filepath = path.join(process.cwd(), filename);
		console.log(`File saved this location: ${filepath}`);
		fs.writeFileSync(filename, JSON.stringify(dataClient, null, "\t"), 'utf-8');

		const createUserDto: CreateUserDto = {
			login: dataClient.login,
			first_name: dataClient.first_name,
			last_name: dataClient.last_name,
			email: dataClient.email,
			image: dataClient.image.link,
			channels: [],
			messages: [],
		};

		const	responseData = await this.apiService.fetchUserData(createUserDto);
		if (!responseData)
			return ({message: 'BACKEND NOK'});
		const cookie = await this.jwtService.signAsync(createUserDto, {expiresIn: '1h'});

		console.log("cookie ama jwt olan", cookie);
		// Burada return ederken cookie bilgisini ve ok diye return edecegiz
		return {message: "BACKEND OK", responseData: createUserDto, cookie: cookie};
	}

	@UseGuards(AuthGuard)
	@Get('cookie')
	async userCookie(
		@Req() {user},
	){
		try
		{
			if (!user)
				throw (new Error("Cookie not provided"));
			console.log("GUARD'dan gelen decoded edilmis user:", user);
			return ({message: "COOKIE OK"});
		}
		catch(err)
		{
			console.error("Cookie err:", err);
			return ({message: "COOKIE NOK"});
		}
	}
}
