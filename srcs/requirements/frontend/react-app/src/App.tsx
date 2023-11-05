import React, { useEffect, useState } from "react";
import { Routes, Route, Link } from 'react-router-dom';
import './App.css';
import HomePage from "./main/HomePage";
import Address from "./client/Address";
import Loading from "./login/Loading";
import Login from "./login/Login";
import Api from "./login/Api";
import Add from "./add/Add";


function App() {
const [loading, setLoading] = useState(true);

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

return (
	<div id="id-app">
	<header>
		<ul>
		<li><Link to="/">Anasayfa</Link></li>
		<li><Link to="/login">Login</Link></li>
		<li><Link to="/address">Address</Link></li>
		<li><Link to="/loading">Loading Screen</Link></li>
		<li><Link to="/add">Add Database</Link></li>
		</ul>
	</header>
	<Routes>
		<Route path="/" element={<HomePage />} />
		<Route path="/login" element={<Login />} />
		<Route path="/address" element={<Address />} />
		<Route path="/loading" element={<Loading />} />
		<Route path="/api" element={<Api />} />
		<Route path="/add" element={<Add />} />
	</Routes>
	</div>
);
};

export default App;