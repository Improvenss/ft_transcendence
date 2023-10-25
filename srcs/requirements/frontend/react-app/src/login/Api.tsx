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

	async function sendAccessToken() {
		const	form = new FormData();
		form.append('grant_type', 'authorization_code');
		form.append('client_id', process.env.REACT_APP_UID as string);
		form.append('client_secret', process.env.REACT_APP_SECRET as string);
		form.append('code', code as string);
		form.append('redirect_uri', process.env.INTRA_REDIRECT_URI as string);
		const	responseToken = await fetch(process.env.REACT_APP_TOKEN_URL as string, {
			method: "POST",
			body: form
		})
		const data = await responseToken.json();
		console.log(responseToken);
	};
	sendAccessToken();
	console.log(code);
	useEffect(() => {
		navigate('/');
	}, [])

	return (
		<div>
			<p>You are authorized!</p>
		</div>
	);
};