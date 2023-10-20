import React, { useEffect, useState } from "react";
import { Routes, Route, Link } from 'react-router-dom';
import './App.css';
import HomePage from "./main/HomePage"; // '/' root dizini.
import Countdown from "./login/Countdown";
import Address from "./client/Address";
import Loading from "./login/Loading";

// function	useEffect()
// {
// 	// const	loadingScreen = document.getElementsByClassName('loading-screen');

// 	window.addEventListener('load', () => {
// 		const	loadingScreen = document.getElementById('loading-screen')

// 		if (loadingScreen)
// 			loadingScreen.
// 	});
// }



function	App()
{
	const	[loading, setLoading] = useState(true);

	useEffect(() =>
	{
		setTimeout(() => setLoading(false), 1000)
	}, []);

	if (loading)
	{
		// return (loading ? <Loading/> : <App/>);
		return (<Loading/>);
	}

	return (
		<div id="id-app">
			<header>
				<ul>
					<li><Link to="/">Anasayfa</Link></li>
					<li><Link to="/login">Login</Link></li>
					<li><Link to="/address">Address</Link></li>
				</ul>
			</header>
			<Routes>
				<Route path="/" element={<HomePage/>} />
				<Route path="/address" element={<Address/>} />
				{/* <Route path="/login" element={</>} /> */}
				{/* <Route path="*" element={<NotLoaded/>} /> */}
			</Routes>
		</div>
	);
};

export default	App;

//------------------------------------------------

// import React, { useEffect } from 'react';
// import { BrowserRouter as Router, Route, Redirect } from 'react-router-dom';
// import Main from './main/Main.tsx';


// const App = () => {
// useEffect(() => {
// 	// Sayfa yüklendiğinde yükleme ekranını kaldır
// 	window.addEventListener('load', () => {
// 	const loadingScreen = document.getElementById('loading-screen');
// 	if (loadingScreen)
// 		loadingScreen.style.display = 'none';
// 	});
// }, []);

// return (
// 	<Router>
// 	<div id="loading-screen">Sayfa şu anda yükleniyor. Lütfen bekleyiniz.</div>
// 		<Route path="/login" component={Main} />
// 		<Redirect to="/login" />
// 	</Router>
// );
// };

// export default App;
