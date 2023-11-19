import React, { useEffect, useState } from "react";
import { Navigate, useNavigationType } from "react-router-dom";
import './HomePage.css';
import { useAuth } from '../login/AuthHook';
import UserInput from "./UserInput";

function HomePage(){
	console.log("---------HOME-PAGE---------");
	const isAuth = useAuth().isAuth;

	if (!isAuth)
	{
		return (
			<Navigate to='/login' replace />
		);
	}

	const [isVisible, setVisible] = useState(true);
	const navigationType = useNavigationType();
	const status = localStorage.getItem('userLoginPage');

	useEffect(() => {
		window.onbeforeunload = () => localStorage.removeItem('userLoginPage');
		return () => {
			window.onbeforeunload = null;
		};
	}, []);

	useEffect(() => {
			if (navigationType === 'PUSH') // Bir sayfadan diğerine "push" ile geçildi.
				localStorage.removeItem('userLoginPage');
			if (navigationType === 'REPLACE') // Bir sayfanın üzerine "replace" ile yazıldı.
				localStorage.removeItem('userLoginPage');
			if (navigationType === 'POP') // Geri düğmesine tıklandı.
				localStorage.removeItem('userLoginPage');
	}, [navigationType]);

	return (
		<div id="home-page">
			<h1>HomePage</h1>
			{ status && isVisible && <UserInput setVisible={setVisible}/> }
		</div>
	)
}
export default HomePage;
