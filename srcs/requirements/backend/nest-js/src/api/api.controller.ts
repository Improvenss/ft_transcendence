import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiService } from './api.service';
// import { CreateApiDto } from './dto/create-api.dto';
// import { UpdateApiDto } from './dto/update-api.dto';
import * as fs from 'fs';
import { CreateUserDto } from '../users/dto/create-user.dto';
// import { channel } from 'diagnostics_channel';


@Controller('api')
export class ApiController {
	constructor(private readonly apiService: ApiService) {}

	// @Post()
	// create(@Body() createApiDto: CreateApiDto) {
	// 	return this.apiService.create(createApiDto);
	// }

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
	 * 
	 * Buradaki islemler bittigi anda 42 API'den user'in butun
	 *  bilgileri alinmis olacak.
	 * 
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
			image: dataClient.image,
			channels: null,
			messages: null
		};

		const	responseData = await this.apiService.fetchUserData(createUserDto);
		const jwt = require('jsonwebtoken'); // npm install jsonwebtoken
		const cookie = jwt.sign(createUserDto, 'your_secret_key', { expiresIn: '1h' });

		// return ({message: "User data successfully saved database."});
		// Burada return ederken cookie bilgisini ve ok diye return edecegiz
		return {message: "BACKEND OK", responseData: createUserDto, cookie: cookie};
	}

	@Post('cookie')
	async userCookie(@Body() status: {cookie: string}){
		const jwt = require('jsonwebtoken');
		if (!status.cookie) {
			console.error("Cookie not provided");
			return { message: "COOKIE NOK" };
		}

		// JWT'yi doğrulayın
		try {
			const decoded = jwt.verify(status.cookie, 'your_secret_key');
			return ({message: "COOKIE OK"});
		} catch(err) {
			console.error("Cookie err:", err);
		}
		return ({message: "COOKIE NOK"});
	}

	// @Get()
	// findAll() {
	// 	return this.apiService.findAll();
	// }

	// @Get(':id')
	// findOne(@Param('id') id: string) {
	// 	return this.apiService.findOne(+id);
	// }

	// @Patch(':id')
	// update(@Param('id') id: string, @Body() updateApiDto: UpdateApiDto) {
	// 	return this.apiService.update(+id, updateApiDto);
	// }

	// @Delete(':id')
	// remove(@Param('id') id: string) { return this.apiService.remove(+id);
	// }
}
