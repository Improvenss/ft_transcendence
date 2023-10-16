import React from "react";
import { Routes, Route, Link } from 'react-router-dom';
import Countdown from "./login/Countdown";
import OldLogin from "./login/OldLogin";

function	App()
{
	return (
		<div>
			asdfasdf
			<nav>
				<ul>
					<li>
						<Link to="/">Anasayfa</Link>
					</li>
					<li>
						<Link to="/login">Login</Link>
					</li>
				</ul>
			</nav>
			<Routes>
				<Route path="/" element={<Countdown/>} />
				<Route path="/login" element={<OldLogin/>} />
			</Routes>
		</div>
	);
};

export default	App;