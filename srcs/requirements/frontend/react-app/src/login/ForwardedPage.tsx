import React from 'react';
import { Router, Route, Link, Routes } from 'react-router-dom';
import Sample from './Countdown';

function ForwardedPage()
{
	return (
		<Routes>
			<li><Link to={"/about"}>About'a git tikla bak yenilenecek mi?</Link></li>
			<Route path="/about" element={<Sample />} />
		</Routes>
	);
}

export default ForwardedPage;