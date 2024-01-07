import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ApiService } from './api.service';
import * as fs from 'fs';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { JwtService } from '@nestjs/jwt';

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
	async	loginStatus(
		@Body() status: {requestLogin: string}
	) {
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
	async	loginToken(
		@Body() status: {code: string}
	) {
		try {
			// return ({ success: false, err: err.message});
			// Burada 2/3 access_token'i aliyoruz
			const dataToken = await this.apiService.fetchToken(status);

			// Burada 3/3 user(dataClient) verisini aliyoruz.
			const dataClient = await this.apiService.fetchAccessToken(dataToken);

			// 42 API'sinden alinan butun veriyi dosyaya kaydet.(opsiyonel)
			const path = require('path');
			const filename = "me_data.json";
			const filepath = path.join(process.cwd(), filename);
			console.log(`File saved this location: ${filepath}`);
			fs.writeFileSync(filename, JSON.stringify(dataClient, null, "\t"), 'utf-8');

			const createUserDto: CreateUserDto = {
				login: dataClient.login,
				displayname: dataClient.displayname,
				imageUrl: dataClient.image.link,
				email: dataClient.email,
			};

			const userData = await this.apiService.fetchCreateUserData(createUserDto);

			const cookieDatas = {
				id: userData.id,
				login: userData.login,
				displayname: userData.displayname,
				imageUrl: userData.imageUrl,
				email: userData.email,
			}

			const cookie = await this.jwtService.signAsync(cookieDatas, {expiresIn: '1h'});
			console.log("User Jwt Token(for postman):", cookie);
			return ({ success: true, responseData: cookieDatas, cookie: cookie});
		} catch (err) {
			console.log("Api:", err.message);
			return ({ success: false, err: err.message});
		}
	}
}
