// import React, { useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// //import axios from 'axios'

// export default function	Api()
// {
// 	const	navigate = useNavigate();

// 	const	urlParams = new URLSearchParams(window.location.search);
// 	const	uriCode = urlParams.get('code');

// 	async function sendCode() {
// 		const response = await fetch("http://localhost:3000/login", {
// 			method: 'POST',
// 			headers: {
// 				'Content-Type':'application/json'
// 			 },
// 			//mode: 'no-cors',
// 			body: JSON.stringify({
// 				code: uriCode as string
// 			})
// 		})
// 		//const data = await response.json();
// 		if (response.ok)
// 		{
// 			//console.log(data.json());
// 			const data = await response.json();
//       		console.log("Server response:", data);
// 			console.log("OK");
// 		}
// 		else
// 			console.log("NOK");
// 	}
// 	sendCode();

// 	console.log(uriCode);
// 	useEffect(() => {
// 		navigate('/');
// 	}, [navigate])

// 	return (
// 		<div>
// 			<p>You are authorized!</p>
// 		</div>
// 	);
// };

// 	//async function sendAccessToken() {
// 	//	const	form = new FormData();
// 	//	form.append('grant_type', 'authorization_code');
// 	//	form.append('client_id', process.env.REACT_APP_UID as string);
// 	//	form.append('client_secret', process.env.REACT_APP_SECRET as string);
// 	//	form.append('code', code as string);
// 	//	form.append('redirect_uri', process.env.INTRA_REDIRECT_URI as string);
// 	//	const	responseToken = await fetch(process.env.REACT_APP_TOKEN_URL as string, {
// 	//		method: "POST",
// 	//		body: form
// 	//	})
// 	//	const data = await responseToken.json();
// 	//	console.log(responseToken);
// 	//	console.log(data);
// 	//};
// 	//sendAccessToken();