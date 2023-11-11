import React from "react";
import { Navigate } from "react-router-dom";
import './HomePage.css';

interface HomePageProps {
	isAuth: boolean;
}

function HomePage({isAuth}: HomePageProps){
	if (!isAuth)
	{
		return (
			<Navigate to='/login' replace />
		);
	}

	return (
		<div id="home-page">
			<h1>HomePage</h1>
		</div>
	)
}
export default HomePage;