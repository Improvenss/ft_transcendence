import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthHook';
import LoadingPage from '../utils/LoadingPage';
import Cookies from 'js-cookie';

interface IUserProps{
	id: number;
	login: string;
	socket_id: string;
	first_name: string;
	last_name: string;
	email: string;
	image: string;
}

const UserContext = createContext<{
	userInfo: IUserProps | undefined;
  }>({
	userInfo: undefined,
  });

export function UserProvider({children}: {children: React.ReactNode}) {
	console.log("---------USERHOOK-PAGE---------");
	const isAuth = useAuth().isAuth;
	const userCookie = Cookies.get("user");
	const [userInfo, setUserInfo] = useState<IUserProps | undefined>(undefined);

	useEffect(() => {
		if (isAuth === true){
			const checkUser = async () => {
				console.log("IV: ---User Checking---");
				const response = await fetch(process.env.REACT_APP_USER as string, {
					method: "POST",
					headers: {
						"Content-Type": "application/json"
					},
					body: JSON.stringify({
						cookie: userCookie as string
					})
				});
				if (response.ok){
					console.log("IV: ---User Backend Connection '✅'---");
					const data = await response.json();
					if (data.message === 'USER OK'){
						console.log("IV: ---User Response '✅'---");
						setUserInfo({
							id: data.user.id,
							login: data.user.login,
							socket_id: data.user.socket_id,
							first_name: data.user.first_name,
							last_name: data.user.last_name,
							email: data.user.email,
							image: data.user.image,
						});
						console.log("userInfo:", data.user);
					} else {
						console.log("IV: ---User Response '❌'---");
					}
				} else {
					console.log("IV: ---User Backend Connection '❌'---");
				}
			}
			checkUser();
		} 
	}, []);

	if ((isAuth === true && userInfo === undefined))
		return (<LoadingPage />);

	return (
		<>
			<UserContext.Provider value={{ userInfo }}>
				{children}
			</UserContext.Provider>
		</>
	);
}

export function useUser(){
	return useContext(UserContext);
}
