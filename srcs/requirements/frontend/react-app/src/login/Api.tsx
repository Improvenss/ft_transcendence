import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function	Api()
{
	const	navigate = useNavigate();

	// 42'nin Authorize butonuna tikladiktan sonra gelen kod.
	const	urlParams = new URLSearchParams(window.location.search);
	const	uriCode = urlParams.get('code');

	async function sendCode() {
		const response = await fetch("https://localhost:3000/api", {
			method: 'POST',
			headers: {
				'Content-Type':'application/json'
			 },
			// mode: 'no-cors',
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
	}
	sendCode();

	useEffect(() => {
		navigate('/');
	}, [navigate]);

	return (
		<div>
		</div>
	);
};