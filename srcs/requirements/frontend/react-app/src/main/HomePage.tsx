import React from "react";
import { Link, Router } from "react-router-dom";

function	HomePage()
{
	return (
		<div className="main-page">
			<nav>
				<ul>
					<li><Link to="/">Anasayfa</Link></li>
					<li><Link to="/login">Login</Link></li>
					<li><Link to="/address">Address</Link></li>
				</ul>
			</nav>
			{/* <Router */}
		</div>
	);
};

export default	HomePage;