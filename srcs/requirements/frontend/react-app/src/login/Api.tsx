import React, { useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import Cookies from 'js-cookie';
import { useAuth } from './AuthHook';

function Api()
{
	console.log("---------API-PAGE---------");
	const	{isAuth, setAuth} = useAuth();
	const	urlParams = new URLSearchParams(window.location.search);
	const	uriCode = urlParams.get('code');
	const	navigate = useNavigate();
	
	if (isAuth){
		return (<Navigate to='/' replace />);
	}

	if (window.opener){ //popup bir açılır pencere olup olmadığını kontrol ediyor
		window.opener.postMessage({ message: 'popupRedirect', additionalData: uriCode }, process.env.REACT_APP_IP);
		window.close();
		return (<></>);
	}

	useEffect(() => {
		async function sendCode() {
			console.log("III: ---API Token Connection---");
			const response = await fetch(process.env.REACT_APP_API_TOKEN as string, {
				method: 'POST',
				headers: {
					'Content-Type':'application/json'
				},
				body: JSON.stringify({
					code: uriCode as string
				})
			})
			if (response.ok)
			{
				console.log("III: ---API Token Connection '✅'---");
				const data = await response.json();
				if (data.message === 'BACKEND OK')
				{
					console.log("III: ---API Token Backend Response '✅'---");
					localStorage.setItem("user", data.cookie);
					Cookies.set("user", data.cookie);
					setAuth(true);
					localStorage.setItem("userLoginPage", "true");
					navigate('/', {replace: true});
					//navigate("/", {replace: true, state: true});
				}
				else{
					console.log("III: ---API Token Backend Response '❌'---");
				}
			}
			else
				console.log("III: ---API Token Connection '❌'---");
		}
		{ !isAuth && sendCode() }
	}, []);

	return (
		<>
			{ !isAuth && <Navigate to='/login' replace/> }
			{/*{ isAuth ? <Navigate to='/' replace /> : <></>}*/}
			{/*{ isAuth ? <Navigate to='/' replace state={{ userStatus: true }}/> : <></>}*/}
		</>
		);
};

export default Api;

/*
	// --------------- Cookie bilgilerini backende gönder  ---------------------------
	// kullanıcı cookie sahipse login butonuna tıklayamaz çünkü /login sayfasına yönlendirilemez.
	// ama kullanıcı hatalı bir cookie sahip ise cookie kontrol kısmında kontrol edilip girişi engellenecektir.
	// Bu durumda, sahte cookie ile login butonuna tıklayabilir olmalıdır
	// kullanıcı kayıt olduğunda cookie bilgisi backend'den response edilecektir.
	//const cookieValue = CookieGenerate();

	// localStorage: eriler, tarayıcı kapatılsa bile kalıcı olarak saklanır. Yani tarayıcı kapatılıp tekrar açıldığında bile veriler hala mevcut olacaktır.
	// sessionStorage: Tarayıcı penceresi veya sekmesi açık olduğu sürece veriler saklanır. Tarayıcı penceresi kapatıldığında veya sekme kapatıldığında veriler silinir.
	// localStorage ve sessionStorage'un aksine, Cookies'in bir son kullanma tarihi vardır ve bu tarih geçtikten sonra otomatik olarak silinir. Bu, belirli bir süre boyunca veri tutmak istediğiniz durumlar için faydalı olabilir.

	//console.log(data.cookie);
	//const browserCookie = document.cookie; //tarayıcıdaki cookiler çekilebiliniyor.
	//console.log(browserCookie);
 */
