import React, { useEffect, useState } from "react";
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import './App.css';
import HomePage from "./main/HomePage";
import Api from "./login/Api";
import LoadingPage from "./login/LoadingPage";
import NoMatchPage from "./main/NoMatchPage";
import LoginPage from "./login/LoginPage";
import Cookies from 'js-cookie';

function App() {
	const navigate = useNavigate();
	// const [isLoading, setLoading] = useState(true);
	const [isLoading, setLoading] = useState(true);
	const [isAuth, setAuth] = useState(() => {
		const user = Cookies.get("user");
		return !!user;
	});

	useEffect(() => {
		const handleLoad = () => {
			setLoading(false);
		};
		
		window.addEventListener('load', handleLoad);
		
		return () => {
			window.removeEventListener('load', handleLoad);
		};
	}, []);
		
	// if (isLoading) {
	// 	return (<LoadingPage />);
	// }

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
			<Route path='/login' element={<LoginPage isAuth={isAuth} setAuth={setAuth}/>} />
			<Route path='/api' element={<Api isAuth={isAuth} setAuth={setAuth} />} />
			<Route path='*' element={<NoMatchPage />} />
		</Routes>
		</div>
	);
};

export default App;