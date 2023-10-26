import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

async function sendCode( uriCode: string ) {

		// const	responseCode = await fetch("http://10.12.14.8:3000/", {
		// 	method: 'POST',
		// 	headers: {
		// 		'Content-Type':'application/json'
		// 	 },
		// 	body: JSON.stringify({
		// 		code: code,
		// 	})
		// })
		const response = await fetch("https://localhost:3000/api", {
			method: 'POST',
			headers: {
				'Content-Type':'application/json'
			 },
			//mode: 'no-cors',
			body: JSON.stringify({
				code: uriCode as string
			})
		})
		if (response.ok)
		{
			const data = await response.json();
			console.log("Server response:", data);
			console.log("OK");
		}
		else
			console.log("NOK");
		console.log("Backend'ten gelen code infosu:", response);
}

export default function	Api()
{
	const	navigate = useNavigate();

	// 42'nin Authorize butonuna tikladiktan sonra gelen kod.
	const	urlParams = new URLSearchParams(window.location.search);
	const	code = urlParams.get('code');

	sendCode(code as string);

	useEffect(() => {
		navigate('/');
	}, [navigate]);

	return (
		<div>
			<p>You are authorized!</p>
		</div>
	);
};