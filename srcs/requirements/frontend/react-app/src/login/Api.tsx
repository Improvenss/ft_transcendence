import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from 'js-cookie';

interface ApiProps {
	isAuth: boolean;
	setAuth: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function	Api({isAuth, setAuth}: ApiProps)
{
	const	navigate = useNavigate();

	// 42'nin Authorize butonuna tikladiktan sonra gelen kod.
	const	urlParams = new URLSearchParams(window.location.search);
	const	uriCode = urlParams.get('code');

	async function sendCode() {
		const response = await fetch(process.env.REACT_APP_API_TOKEN as string, {
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
			if (data.message === 'BACKEND OK')
			{
				//*************   Cookie bilgilerini backende gönder  *********************/
				// kullanıcı cookie sahipse login butonuna tıklayamaz çünkü /login sayfasına yönlendirilemez.
				// ama kullanıcı hatalı bir cookie sahip ise cookie kontrol kısmında kontrol edilip girişi engellenecektir.
				// Bu durumda, sahte cookie ile login butonuna tıklayabilir olmalıdır
				// kullanıcı kayıt olduğunda cookie bilgisi backend'den response edilecektir.
				//const cookieValue = CookieGenerate();

				// localStorage: eriler, tarayıcı kapatılsa bile kalıcı olarak saklanır. Yani tarayıcı kapatılıp tekrar açıldığında bile veriler hala mevcut olacaktır.
				// sessionStorage: Tarayıcı penceresi veya sekmesi açık olduğu sürece veriler saklanır. Tarayıcı penceresi kapatıldığında veya sekme kapatıldığında veriler silinir.
				// localStorage ve sessionStorage'un aksine, Cookies'in bir son kullanma tarihi vardır ve bu tarih geçtikten sonra otomatik olarak silinir. Bu, belirli bir süre boyunca veri tutmak istediğiniz durumlar için faydalı olabilir.


				//console.log(data.cookie);
				Cookies.set("user", data.cookie);
				setAuth(true);
				const browserCookie = document.cookie; //tarayıcıdaki cookiler çekilebiliniyor.
				console.log(browserCookie);
				console.log("OK");
				navigate("/");
			}
		}
		else
		{
			console.log("NOK");
			navigate('/login');
		}
	}
	useEffect(() => {
		sendCode();
	  }, []);

	return (
		<div>
		</div>
	);
};