import { Injectable } from '@nestjs/common';
import { CreateApiDto } from './dto/create-api.dto';
import { UpdateApiDto } from './dto/update-api.dto';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class ApiService {
	constructor(
		private readonly	usersService: UsersService
		) {}

	create(createApiDto: CreateApiDto) {
		return 'This action adds a new api';
	}

	findAll() {
		return `This action returns all api`;
	}

	findOne(id: number) {
		return `This action returns a #${id} api`;
	}

	update(id: number, updateApiDto: UpdateApiDto) {
		return `This action updates a #${id} api`;
	}

	remove(id: number) {
		return `This action removes a #${id} api`;
	}

	/**
	 * 2/3. adim.
	 * Token kodunu aliyoruz.
	 * 
	 * @param status Auth'dan onayladiktan sonra donen link'i
	 * 	aldik buraya verdik.
	 * @returns access_token from 42 API.
	 */
	async	fetchToken(status: {code: string}) {
		const response = await fetch(process.env.API_TOKEN_URL, {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				grant_type: "authorization_code",
				client_id: process.env.API_UID,
				client_secret: process.env.API_SECRET,
				code: status.code,
				redirect_uri: process.env.API_REDIR_URI
			})
		});
		return (response);
	}

	/**
	 * 3/3. adim.
	 * 
	 * fetchToken()'den aldigimiz 'access_token' ile 'user'
	 *  verisini cekmek icin 3. istegimizi atiyoruz.
	 * 
	 * @param dataToken access_token
	 * @returns 'user's all data from 42 API.
	 */
	async	fetchAccessToken(dataToken: any) {
		const	responseAccessToken = await fetch(process.env.API_ME_URL, {
			method: "GET",
			headers: {
				"Authorization": "Bearer " + dataToken.access_token
			}
		});
		return (responseAccessToken);
	}

	async	fetchUserData(dataClient: any) {
		const	tmpDb = await this.usersService.findOne(undefined, dataClient.login);
		if (tmpDb)
			return ("User already exist in DB.");
		const	responseSave = await this.usersService.create(dataClient);
		return (responseSave);
	}
}
