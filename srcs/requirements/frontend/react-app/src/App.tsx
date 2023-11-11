import React, { useEffect, useState } from "react";
import { Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import './App.css';
import HomePage from "./main/HomePage";
import Api from "./login/Api";
import LoadingPage from "./login/LoadingPage";
import NoMatchPage from "./main/NoMatchPage";
import LoginPage from "./login/LoginPage";
import Cookies from 'js-cookie';
import ChatPage from "./chat/ChatPage";

async function checkAuth(setAuth: React.Dispatch<React.SetStateAction<boolean>>) {
	console.log("I: ---Cookie Checking---");
	const userCookie = Cookies.get("user");
	const userLStore = localStorage.getItem("user");
	//console.log(userLStore);
	const response = await fetch(process.env.REACT_APP_API_COOKIE as string, {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
		cookie: userCookie as string
		})
	});

	if (response.ok) {
		console.log("I: ---Cookie Backend Connection '✅'---");
		const data = await response.json();
		if (data.message === "COOKIE OK") {
			console.log("I: ---Cookie Response '✅'---");
			setAuth(true);
		} else {
			console.log("I: ---Cookie Response '❌'---");
		}
		} else {
		console.log("I: ---Cookie Backend Connection '❌'---");
		}
}

function App() {
	const navigate = useNavigate();
	const [isLoading, setLoading] = useState(true);
	const [isAuth, setAuth] = useState(false);

	useEffect(() => {
		const fetchData = async () => {
            await checkAuth(setAuth);
			setLoading(false);
        };
		window.addEventListener('load', fetchData);
		const timer = setTimeout(fetchData, 1000);

		return () => {
			window.removeEventListener('load', fetchData);
			clearTimeout(timer);
		  };
	}, []);
		
	 if (isLoading) {
	 	return (<LoadingPage />);
	 }

	function logOut() {
		setAuth(false);
		Cookies.remove('user');
		localStorage.removeItem('user');
		//navigate('/login');
		return (<Navigate to='/login' replace/>); //geri butonuna basınca mal olmasın diye ekleniyor
	}

	return (
		<div id="id-app">
			<header>
			<ul>
				{ isAuth && <Link to="/" style={{ padding: 5 }}> Home </Link> }
				{/*{ isAuth && <Link to="/chat" style={{ padding: 5 }}> Chat </Link> }*/}
				{ isAuth && <span onClick={logOut} style={{ padding: 5, cursor: 'pointer' }}> Logout </span> }
			</ul>
		</header>
		<Routes>
			<Route path='/' element={<HomePage isAuth={isAuth} />} />
			{/*<Route path='/chat' element={<ChatPage isAuth={isAuth} />} />*/}
			<Route path='/login' element={<LoginPage isAuth={isAuth} />} />
			<Route path='/api' element={<Api setAuth={setAuth} />} />
			<Route path='*' element={<NoMatchPage />} />
		</Routes>
		</div>
	);
};

export default App;