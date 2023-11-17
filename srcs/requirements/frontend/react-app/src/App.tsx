import React from 'react';
import logo from './logo.svg';
import './App.css';
import { Link, Route, Routes } from 'react-router-dom';
import ChatPage from './chat/ChatPage';

function App() {
	return (
		<div id="id-app">
			<header>
			<ul>
				{/* { isAuth && <Link to="/" style={{ padding: 5 }}> Home </Link> } */}
				{/* { isAuth && <Link to="/chat" style={{ padding: 5 }}> Chat </Link> } */}
				{ <Link to="/chat" style={{ padding: 5 }}> Chat </Link> }
				{/* { isAuth && <span onClick={logOut} style={{ padding: 5, cursor: 'pointer' }}> Logout </span> } */}
			</ul>
		</header>
			<Routes>
				{/* <Route path='/' element={<HomePage />} /> */}
				<Route path='/chat' element={<ChatPage />} />
				{/* <Route path='*' element={<NoMatchPage />} /> */}
				{/* <Route path='/api' element={<Api />} /> */}
				{/* <Route path='/login' element={<LoginPage />} /> */}
			</Routes>
		</div>
	);
}

export default App;
