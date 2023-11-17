import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import './HomePage.css';
import { useAuth } from '../login/AuthHook';
//import UserInput from './UserInput'

function HomePage(){
	const isAuth = useAuth().isAuth;
	//const location = useLocation();
	console.log("---------HOME-PAGE---------");
	if (!isAuth)
	{
		return (
			<Navigate to='/login' replace />
		);
	}

	//console.log(location);

	return (
		<div id="home-page">
			<h1>HomePage</h1>
			{/*{location.state && location.state.userStatus && (
				<UserInput />
			)}*/}
		</div>
	)
}
export default HomePage;
