import React, { useEffect, useState } from "react";
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import './App.css';
import HomePage from "./main/HomePage";
import Address from "./client/Address";
import Loading from "./login/Loading";
import Login from "./login/Login";
import Api from "./login/Api";



function App() {
const [loading, setLoading] = useState(true);
const navigate = useNavigate();

const handleLoad = (e: Event) => {
	setLoading(false);
};

useEffect(() => {
	window.addEventListener('load', handleLoad);
	return () => {
	// window.removeEventListener('load', handleLoad);
	};
}, []);

if (loading) {
	return (<Loading />);
}

// if (!client.isAuthenticate())
// 	navigate('/login');

return (
	<div id="id-app">
	<header>
		<ul>
		<li><Link to="/">Anasayfa</Link></li>
		<li><Link to="/login">Login</Link></li>
		<li><Link to="/address">Address</Link></li>
		<li><Link to="/loading">Loading Screen</Link></li>
		</ul>
	</header>
	<Routes>
		<Route path="/" element={<HomePage />} />
		<Route path="/login" element={<Login />} />
		<Route path="/address" element={<Address />} />
		<Route path="/loading" element={<Loading />} />
		<Route path="/api" element={<Api />} />
	</Routes>
	</div>
);
};

export default App;




// import React, { useEffect, useState } from "react";
// import { Routes, Route, Link, useNavigate } from 'react-router-dom';
// // import { Helmet } from "react-helmet"; // Bu React JSX'in icerisinde <link> calistirabilmek icin.
// import './App.css';
// import HomePage from "./main/HomePage"; // '/' root dizini.
// import Address from "./client/Address";
// import Loading from "./login/Loading";
// import isAuthenticated from "./client/Authenticate"; // 42api ile giris yapildiktan sonra kontrol edilirken.

// function	App()
// {
// 	const	[loading, setLoading] = useState(true);
// 	const	navigate = useNavigate();

// 	const handleLoad = (e: Event) => {
// 		setLoading(false);
// 	};

// 	useEffect(() =>
// 	{
// 		window.addEventListener('load', handleLoad);
// 		return () => {
// 			// window.removeEventListener('load', handleLoad);
// 		};
// 	}, []);

// 	if (loading)
// 	{
// 		return (<Loading/>);
// 	}

// 	useEffect(() =>
// 	{
// 		if (isAuthenticated())
// 			navigate('/login');
// 	}, []);

// 	// useEffect(() => {}, []);

// 	return (
// 		<div id="id-app">
// 			{/* <Helmet>
// 			</Helmet> */}
// 			<header>
// 				<ul>
// 					<li><Link to="/">Anasayfa</Link></li>
// 					<li><Link to="/login">Login</Link></li>
// 					<li><Link to="/address">Address</Link></li>
// 				</ul>
// 			</header>
// 			<Routes>
// 				<Route path="/" element={<HomePage/>} />
// 				{/* <Route path="/login" element={<Login/>} /> */}
// 				<Route path="/address" element={<Address/>} />
// 			</Routes>
// 		</div>
// 	);
// };

// export default	App;