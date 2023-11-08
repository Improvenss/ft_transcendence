import React, { useEffect, useState } from "react";
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import './App.css';
import HomePage from "./main/HomePage";
import Api from "./login/Api";
import LoadingPage from "./login/LoadingPage";
import NoMatchPage from "./main/NoMatchPage";
import LoginPage from "./login/LoginPage";
import Cookies from 'js-cookie';
import ChatPage from "./socket/ChatPage";

function App() {
	const navigate = useNavigate();
	const [isLoading, setLoading] = useState(true);
	const [isAuth, setAuth] = useState(() => {
		const userCookie = Cookies.get("user");

		async function sendCookie() {
			console.log("kakam gledi", process.env.REACT_APP_API_COOKIE as string);
			const response = await fetch(process.env.REACT_APP_API_COOKIE as string, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					cookie: userCookie as string,
				})
			})

			if (response.ok){
				const data = await response.json();
				console.log(data);
				console.log("BACKEND CONNECTION OK");
				if (data.message === 'COOKIE OK')
				{
					return (true);
				}
				return (false);
			}
			else{
				console.log("BACKEND CONNECTION NOK");
				console.log("COOKIE NOK");
				return (false);
			}
		}

		const cookieResponse = sendCookie();
		cookieResponse.then(data => {
		  if (data) {
			setAuth(true);
		  } else {
			setAuth(false);
		  }
		});
		return (!!cookieResponse);
	});

	useEffect(() => {
		const handleLoad = () => {
			setLoading(false);
		};
		const timer = setTimeout(handleLoad, 1000);
		
		window.addEventListener('load', handleLoad);
		
		return () => {
			window.removeEventListener('load', handleLoad);
			clearTimeout(timer);
		  };
	}, []);
		
	 if (isLoading) {
	 	return (<LoadingPage />);
	 }

	function logOut() {
		setAuth(false);
		navigate('/login');
		Cookies.remove('user');
	}

	return (
		<div id="id-app">
		<header>
			<ul>
				{ isAuth && <Link to="/" style={{ padding: 5 }}> Home </Link> }
				{ isAuth && <Link to="/chat" style={{ padding: 5 }}> Chat </Link> }
				{ isAuth && <span onClick={logOut} style={{ padding: 5, cursor: 'pointer' }}> Logout </span> }
			</ul>
		</header>
		<Routes>
			<Route path='/' element={<HomePage isAuth={isAuth} />} />
			<Route path='/chat' element={<ChatPage isAuth={isAuth} />} />
			<Route path='/login' element={<LoginPage isAuth={isAuth} />} />
			<Route path='/api' element={<Api isAuth={isAuth} setAuth={setAuth} />} />
			<Route path='*' element={<NoMatchPage />} />
		</Routes>
		</div>
	);
};

export default App;