import { Controller, Get, Post, Body } from '@nestjs/common';

@Controller('api')
export class ApiController {
	@Get()
	getApi() {
		return ("Here 'application programming interface' page.");
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
			// const	responseAccessToken = await fetch()
			return {message: "BACKEND OK", other: data.access_token};
		}
		else
			return {message: "BACKEND NOK"};
		return {message: "ESCAPE", other: status.code};
	}
}

/*
export default function	Api()
{
	const	navigate = useNavigate();
	const	urlParams = new URLSearchParams(window.location.search);
	const	uriCode = urlParams.get('code');

	const handlePostRequest = async () => {
	const url = 'https://api.intra.42.fr/oauth/token';
	const data = new URLSearchParams();
	data.append('grant_type', 'authorization_code');
	data.append('client_id', process.env.REACT_APP_UID as string);
	data.append('client_secret', process.env.REACT_APP_SECRET as string);
	data.append('code', uriCode as string);
	data.append('redirect_uri', process.env.REACT_APP_REDIR_URI as string);
	
	try {
		const response = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				},
				body: data.toString(),
			});
			
			if (response.ok) {
				  const responseData = await response.json();
				  console.log(responseData);
				console.log("OK");
			} else {
				  console.error('Hata:', response.status, response.statusText);
				console.log("NOK");
			}
		} catch (error) {
			console.error('Hata:', error);
		}
	}

	handlePostRequest();
	console.log(uriCode);
};
*/


/*
const formData = new URLSearchParams();
formData.append('grant_type', 'authorization_code');
formData.append('client_id', envApi.client_id);
formData.append('client_secret', envApi.client_secret);
formData.append('code', envApi.code);
formData.append('redirect_uri', envApi.redirect_uri);

async function firstCode(){
	const	response = await fetch('https://api.intra.42.fr/oauth/token', {
		method: 'POST',
		//mode: 'no-cors',
		headers: {
			'Content-Type':'application/json'
		 },
		body: formData,
	})
		//body: JSON.stringify(envApi)
	if (response.ok)
	{
		//const data = await response.json();
		return {message: "BACKEND OK"};
	}
	else
	{
		return {message: "BACKEND NOK"};
	}
}
firstCode();*/