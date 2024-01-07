import { Injectable } from '@nestjs/common';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class ApiService {
	constructor( private readonly usersService: UsersService ) {}

	/**
	 * 2/3. adim.
	 * Token kodunu aliyoruz.
	 * @param status Auth'dan onayladiktan sonra donen link'i
	 * 	aldik buraya verdik.
	 * @returns access_token from 42 API.
	 */
	async	fetchToken(
		status: {code: string}
	) {
		try {
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
			if (response.ok){
				const dataToken = await response.json();
				if (!dataToken.err){
					return (dataToken);
				} else {
					throw new Error(dataToken.err);
				}
			} else {
				throw new Error(`HTTP error! Status: ${response.status}`);
			}
		} catch (err){
			console.log("Error during fetchToken:", err.message);
			throw new Error(err.message);
		}
	}

	/**
	 * 3/3. adim.
	 * fetchToken()'den aldigimiz 'access_token' ile 'user'
	 *  verisini cekmek icin 3. istegimizi atiyoruz.
	 * @param dataToken access_token
	 * @returns 'user's all data from 42 API.
	 */
	async	fetchAccessToken(
		dataToken: any
	) {
		try {
			const responseAccessToken = await fetch(process.env.API_ME_URL, {
				method: "GET",
				headers: {
					"Authorization": "Bearer " + dataToken.access_token
				}
			});
			if (responseAccessToken.ok){
				const dataClient = await responseAccessToken.json();
				if (!dataClient.err){
					return (dataClient);
				} else {
					throw new Error(dataClient.err);
				}
			} else {
				throw new Error(`HTTP error! Status: ${responseAccessToken.status}`);
			}
		} catch (err){
			console.log("Error during fetchAccessToken:", err.message);
			throw new Error(err.message);
		}
	}

	async	fetchCreateUserData(dataClient: CreateUserDto) {
		return (await this.usersService.createUser(dataClient));
	}
}
