import React from 'react';
import logo from './logo.svg';
import { Link, Navigate, Route, Routes } from 'react-router-dom';
import Cookies from 'js-cookie';
import './App.css';
import ChatPage from './chat/ChatPage';
import { useAuth } from './login/AuthHook';
import HomePage from './main/HomePage';
import NoMatchPage from './main/NoMatchPage';
import LoginPage from './login/LoginPage';
import Api from './login/Api';

function App() {
	console.log("--->APP PAGE<---");
	const	{ isAuth, setAuth } = useAuth();
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
			<Routes>
				<Route path='/' element={<HomePage />} />
				<Route path='/chat' element={<ChatPage />} />
				<Route path='*' element={<NoMatchPage />} />
				<Route path='/api' element={<Api />} />
				<Route path='/login' element={<LoginPage />} />
			</Routes>
		</div>
	);
};

export default App;