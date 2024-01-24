import { useEffect, useState } from "react";
import MatrixRain from "./utils/MatrixRain";
import Countdown from "./utils/Countdown";
import { Route, Routes, useNavigate } from "react-router-dom";
import NoMatchPage from "./utils/NoMatchPage";
import fetchRequest from "./utils/fetchRequest";
import Api from "./login/Api";
import './LoginApp.css';
import { ReactComponent as IconGithub } from './assets/iconGithub.svg';

interface ILoginProps{
	setClicked: (value: boolean) => void,
	navigate: (to: string, options?: { replace: boolean }) => void,
}

async function	redirectToLogin({setClicked, navigate}: ILoginProps) {
	try {
		// console.log("---API Login Connection---");
		const response = await fetchRequest({
			method: 'GET',
			url: '/api/login',
		}, false);
		if (response.ok){
			const data = await response.json();
			if (!data.err){
				const messageHandler = function(event: MessageEvent<any>) {
					if (event.origin === process.env.REACT_APP_IP) {
						const data = event.data;
						if (data.message === 'popupRedirect'){
							navigate('/api?code=' + data.additionalData, { replace: true });
							window.removeEventListener('message', messageHandler); //birden fazla kez çalışmaması için remove etmemiz gerekiyor.
						}
					}
				}
				window.addEventListener('message', messageHandler);
				window.open(data.requestLogin, "intraPopup", "width=500,height=300");
			} else {
				console.log("---API Login Backend Response '❌'---");
				throw new Error(data.err);
			}
		} else {
			console.log("---API Login Connection '❌'---");
			setClicked(false); // Bu da butonun tekrar tiklanabilir olmamasini sagliyor.
		}
	} catch (err){
		console.log("LoginPage err:", err);
		navigate('/404');
	}
}

function LoginApp() {
	// console.log("---------LOGINAPP-PAGE---------");
	const [clicked, setClicked] = useState(false);
	const navigate = useNavigate();

	useEffect(() => {
		if (clicked === true)
			redirectToLogin({setClicked, navigate});
		/* eslint-disable react-hooks/exhaustive-deps */
	}, [clicked])

	return (
		<div id="login-app">
			<header>
				<a href="https://github.com/Improvenss/ft_transcendence">
					<IconGithub id="icon-github" />
				</a>
			</header>
			<Routes>
				<Route path="*" element={
					<>
						<MatrixRain />
						<button id='login-button' onClick={() => setClicked(true)}  disabled={clicked} >
							<Countdown />
						</button>
					</>
				} />
				<Route path="/api"element={<Api />} />
				<Route path="/404" element={<NoMatchPage />} />
			</Routes>
		</div>
	);
}

export default LoginApp;