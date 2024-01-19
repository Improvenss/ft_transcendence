import { Controller, Post, Body, Get, Req} from '@nestjs/common';
import { ApiService } from './api.service';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '../users/dto/create-user.dto';

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
	@Get('login')
	async loginLink(
		@Req() request: Request,
	) {
		const origin = request.headers['origin']; //env'deki domainden başka bir url buraya erişemiyor.
		if (origin === process.env.DOMAIN) {
			const	URL = `https://api.intra.42.fr/oauth/authorize?client_id=\
${process.env.API_UID}&redirect_uri=\
${process.env.API_REDIR_URI}&response_type=code`;
			return ({requestLogin: URL});
		} else {
			return { err: 'Invalid origin' };
		}
	}

	/**
	 * 2/3 & 3/3 adimlar burada gerceklesiyor.
	 * Buradaki islemler bittigi anda 42 API'den user'in butun
	 *  bilgileri alinmis olacak.
	 * @param status 
	 * @returns 
	 */
	@Post('token')
	async loginToken(
		@Body() status: {code: string},
		@Req() request: Request,
	) {
		try {
			const origin = request.headers['origin'];
			if (origin !== process.env.DOMAIN){
				throw new Error('Invalid origin');
			}

			// Burada 2/3 access_token'i aliyoruz
			const dataToken = await this.apiService.fetchToken(status);

			// Burada 3/3 user(dataClient) verisini aliyoruz.
			const dataClient = await this.apiService.fetchAccessToken(dataToken);

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

			const token = await this.jwtService.signAsync(cookieDatas, {expiresIn: '1h'});
			console.log("User Jwt Token(for postman):", token);

			return ({ success: true, cookie: token });
		} catch (err) {
			console.log("Api:", err.message);
			return ({ success: false, err: err.message});
		}
	}
}
