import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import Cookies from 'js-cookie';
import { useAuth } from "../hooks/AuthHook";
import LoadingPage from "../utils/LoadingPage";
import fetchRequest from "../utils/fetchRequest";

function Api(){
	console.log("---------API-PAGE---------");
	const	{isAuth, setAuth} = useAuth();
	const	[isLoading, setLoading] = useState<boolean>(true);
	const	urlParams = new URLSearchParams(window.location.search);
	const	uriCode = urlParams.get('code');
	const	navigate = useNavigate();

	useEffect(() => {
		async function sendCode() {
			console.log("III: ---API Token Connection---");
			const	response = await fetchRequest({
				method: 'POST',
				body: JSON.stringify({ code: uriCode as string}),
				url: '/api/token',
			}, false);
			if (response.ok) {
				console.log("III: ---API Token Connection '✅'---");
				const data = await response.json();
				if (!data.err){
					console.log("III: ---API Token Backend Response '✅'---");
					localStorage.setItem("user", data.cookie);
					Cookies.set("user", data.cookie);
					localStorage.setItem("userLoginPage", "true");
					setAuth(true);
					
					navigate('/', {replace: true});
				} else {
					console.log("III: ---API Token Backend Response '❌'---");
				}
			} else {
				console.log("III: ---API Token Connection '❌'---");
			}
			setLoading(false);
		}
		if (!window.opener && !isAuth)
			sendCode()
		/* eslint-disable react-hooks/exhaustive-deps */
	}, []);

	if (window.opener){ //popup bir açılır pencere olup olmadığını kontrol ediyor
		window.opener.postMessage({ message: 'popupRedirect', additionalData: uriCode }, process.env.REACT_APP_IP);
		window.close();
		return (<></>);
	}

	if (isAuth){
		return (<Navigate to='/' replace />);
	}

	return (
		<>
			{ isLoading ? <LoadingPage /> : <Navigate to='/login' replace/>}
		</>
	);
};

export default Api;
