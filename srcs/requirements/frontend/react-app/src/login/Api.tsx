import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from 'js-cookie';
import { useAuth } from "../hooks/AuthHook";
import fetchRequest from "../utils/fetchRequest";
import LoadingPage from "../utils/LoadingPage";

function Api(){
	console.log("---------API-PAGE---------");
	const	{setAuth} = useAuth();
	const	urlParams = new URLSearchParams(window.location.search);
	const	uriCode = urlParams.get('code');
	const	navigate = useNavigate();

	useEffect(() => {
		async function sendCode() {
			console.log("---API Token Connection---");
			const	response = await fetchRequest({
				method: 'POST',
				body: JSON.stringify({ code: uriCode as string}),
				url: '/api/token',
			}, false);
			if (response.ok) {
				const data = await response.json();
				if (!data.err){
					localStorage.setItem("user", data.cookie);
					Cookies.set("user", data.cookie);
					navigate('/', { replace: true }); //mecburi değil sadece url'yi temizlemek için var
					setAuth(true);
				} else {
					console.log("---API Token Backend Response '❌'---");
					navigate('/404');
				}
			} else {
				console.log("---API Token Connection '❌'---");
				navigate('/404');
			}
		}
		if (!window.opener)
			sendCode()
		/* eslint-disable react-hooks/exhaustive-deps */
	}, []);

	if (window.opener){ //popup bir açılır pencere olup olmadığını kontrol ediyor
		window.opener.postMessage({ message: 'popupRedirect', additionalData: uriCode }, process.env.REACT_APP_IP);
		window.close();
		return (<></>);
	}

	return (
		<LoadingPage />
	);
};

export default Api;
