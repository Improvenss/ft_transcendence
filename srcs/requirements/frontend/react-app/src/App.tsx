import React, { useEffect } from "react";
import { Routes, Route, Link } from 'react-router-dom';
import Countdown from "./login/Countdown";
import './App.css';
import Address from "./client/Address";
import HomePage from "./main/HomePage";

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
	return (
		<div id="app">
			<nav>
				<ul>
					<li><Link to="/">Anasayfa</Link></li>
					<li><Link to="/login">Login</Link></li>
					<li><Link to="/address">Address</Link></li>
				</ul>
			</nav>
			<Routes>
				{/* <Route path="/" element={<Countdown/>} /> */}
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
