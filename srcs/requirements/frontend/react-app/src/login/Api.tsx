import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";


export default function	Api()
{
	// let	[clientData, setClientData] = useState(null);
	// let [clientData, setClientData] = useState<string | null>(null);
	const	navigate = useNavigate();

	// Yonlendirildikten sonra code ile geri gelen bilgiyi;
	const	urlParams = new URLSearchParams(window.location.search);
	const	code = urlParams.get('code');

	async function sendCode() {
		// const	responseCode = await fetch("http://10.12.14.8:3000/", {
		// 	method: 'POST',
		// 	headers: {
		// 		'Content-Type':'application/json'
		// 	 },
		// 	body: JSON.stringify({
		// 		code: code,
		// 	})
		// })
		const	responseCode = await fetch('http://10.12.14.8:3000/api', {
			method: 'POST',
			headers: {
			  'Content-Type':'application/json'
			},
			mode: 'cors',
			body: JSON.stringify({
			  key: 'this is a value'
			})
		  })

		console.log("Backend'ten gelen code infosu:", responseCode);
	}
	sendCode();

	// async function sendAccessTokenToBackend() {
	// 	const	form = new FormData();
	// 	form.append('grant_type', 'authorization_code');
	// 	form.append('client_id', process.env.REACT_APP_UID as string);
	// 	form.append('client_secret', process.env.REACT_APP_SECRET as string);
	// 	form.append('code', code as string);
	// 	form.append('redirect_uri', process.env.INTRA_REDIRECT_URI as string);
	// 	const	responseToken = await fetch(process.env.REACT_APP_TOKEN_URL as string, {
	// 		headers: {
	// 			'Access-Control-Allow-Origin': '*'
	// 		},
	// 		method: 'POST',
	// 		body: form
	// 	})
	// 	const data = await responseToken.json();
	// 	console.log(responseToken);
	// };
	// console.log(code);
	// sendAccessTokenToBackend();
	useEffect(() => {
		navigate('/');
	}, [])

	return (
		<div>
			<p>You are authorized!</p>
		</div>
	);
};