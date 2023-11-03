/*
// api.service.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class ApiService {
	async fetchToken(status: { code: string }) {
		const response = await fetch(process.env.API_TOKEN_URL, {
			method: 'POST',
			headers: {
				'Content-Type':'application/json'
			},
			body: JSON.stringify({
				grant_type: 'authorization_code',
				client_id: process.env.API_UID,
				client_secret: process.env.API_SECRET,
				code: status.code,
				redirect_uri: process.env.API_REDIR_URI
			})
		});
		return response;
	}

	async fetchAccessToken(data: any) {
		const response = await fetch(process.env.API_ME_URL, {
			method: 'GET',
			headers: {
				"Authorization": "Bearer " + data.access_token
			}
		});
		return response;
	}
}

// api.controller.ts
import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiService } from './api.service';

@Controller('api')
export class ApiController {
	constructor(private readonly apiService: ApiService) {}

	@Get()
	getApi() {
		return ("Here 'application programming interface' page.");
	}

	@Post()
	async getCode(@Body() status: { code: string }) {
		const response = await this.apiService.fetchToken(status);
		
		if (response.ok)
		{
			const	data = await response.json();
			const	responseAccessToken = await this.apiService.fetchAccessToken(data);
			const	dataClient = await responseAccessToken.json();
			return {message: "BACKEND OK", access_token: data.access_token, dataClient: dataClient};
		}
		else
			return {message: "BACKEND NOK"};
		
		return {message: "ESCAPE", other: status.code};
	}
}

*/




import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiService } from './api.service';
import { CreateApiDto } from './dto/create-api.dto';
import { UpdateApiDto } from './dto/update-api.dto';

@Controller('api')
export class ApiController {
	constructor(private readonly apiService: ApiService) {}

	@Post()
	create(@Body() createApiDto: CreateApiDto) {
		return this.apiService.create(createApiDto);
	}

	/**
	 * React'tan ilk butona tikandigi anda buraya geliyor.
	 * 
	 * 
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
			return {message: "BACKEND NOK"};
		const	dataToken = await response.json();

		// Burada 3/3 user(dataClient) verisini aliyoruz.
		const	responseAccessToken = await this.apiService.fetchAccessToken(dataToken);
		if (!responseAccessToken.ok)
			return {message: "BACKEND NOK"};
		const	dataClient = await responseAccessToken.json();

		// const	user = await this.usersService.createUser(dataClient.);
		return {message: "BACKEND OK", access_token: dataToken.access_token, dataClient: dataClient};
		// return {message: "BACKEND OK", access_token: data.access_token, user: user};
	}
	// Sonra da 'users' olusturulacak. 'nest generate resource users' diye.

	@Get()
	findAll() {
		return this.apiService.findAll();
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.apiService.findOne(+id);
	}

	@Patch(':id')
	update(@Param('id') id: string, @Body() updateApiDto: UpdateApiDto) {
		return this.apiService.update(+id, updateApiDto);
	}

	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.apiService.remove(+id);
	}
}

/*

import { Controller, Get, Post, Body, Req } from '@nestjs/common';
import UsersService from 'src/users/users.service';

@Controller('api')
export class ApiController {
	constructor(private readonly usersService: UsersService) {}

	@Get()
	getApi() {
		return ("Here 'application programming interface' page.");
	}

	@Post('login')
	loginStatus(@Body() status: {requestLogin: string}) {
		const	URL = `https://api.intra.42.fr/oauth/authorize?client_id=${process.env.API_UID}&redirect_uri=${process.env.API_REDIR_URI}&response_type=code`;
		if (status.requestLogin === "LOGIN")
			return ({message: "Login Successfully!", requestLogin: URL});
		else
			return ({message: "Connection Failed!", requestLogin: process.env.API_LOGIN_URL});
	}

	@Post()
	async getCode(@Body() status: { code: string }) {
		const response = await fetch(process.env.API_TOKEN_URL, {
			method: 'POST',
			headers: {
				'Content-Type':'application/json'
			},
			body: JSON.stringify({
				grant_type: 'authorization_code',
				client_id: process.env.API_UID,
				client_secret: process.env.API_SECRET,
				code: status.code,
				redirect_uri: process.env.API_REDIR_URI
			})
		})
		if (response.ok)
		{
			const	data = await response.json();
			const	responseAccessToken = await fetch(process.env.API_ME_URL, {
				method: 'GET',
				headers: {
					"Authorization": "Bearer " + data.access_token
				}
			});
			const	dataClient = await responseAccessToken.json();
			return {message: "BACKEND OK", access_token: data.access_token, dataClient: dataClient};
		}
		else
			return {message: "BACKEND NOK"};
		
		return {message: "ESCAPE", other: status.code};
	}
}

*/