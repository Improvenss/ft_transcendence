/*App.tsx */
import React from "react";
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import './App.css';
import HomePage from "./main/HomePage";
import Api from "./login/Api";
import NoMatchPage from "./main/NoMatchPage";
import LoginPage from "./login/LoginPage";
import Cookies from 'js-cookie';
import ChatPage from "./chat/ChatPage";
import { SocketProvider } from "./main/SocketHook";
import { useAuth } from './login/AuthHook';

function App() {
	const { isAuth, setAuth } = useAuth();

	function logOut() {
		setAuth(false);
		Cookies.remove('user');
		localStorage.removeItem('user');
		return (<Navigate to='/login' replace/>); //geri butonuna basınca mal olmasın diye ekleniyor
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
		<SocketProvider>
			<Routes>
				<Route path='/' element={<HomePage />} />
				<Route path='/chat' element={<ChatPage />} />
				<Route path='*' element={<NoMatchPage />} />
				<Route path='/api' element={<Api />} />
				<Route path='/login' element={<LoginPage />} />
			</Routes>
		</SocketProvider>
		</div>
	);
};

export default App;