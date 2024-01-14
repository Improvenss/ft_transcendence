import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthHook';
import LoadingPage from '../utils/LoadingPage';
import Cookies from 'js-cookie';
import fetchRequest from '../utils/fetchRequest';
import { IUserProps } from '../chat/iChannel';

const UserContext = createContext<{
	userInfo: IUserProps | undefined;
  }>({
	userInfo: undefined,
  });

export function UserProvider({children}: {children: React.ReactNode}) {
	console.log("---------USERHOOK-PAGE---------");
	const {isAuth, setAuth} = useAuth();
	const [userInfo, setUserInfo] = useState<IUserProps | undefined>(undefined);

	useEffect(() => {
		if (isAuth){
			const checkUser = async () => {
				console.log("IV: ---User Checking---");
				const response = await fetchRequest({
					method: 'GET',
					url: `/users?relation=notifications&relation=friends&primary=true`,
				});
				if (response.ok){
					console.log("IV: ---User Backend Connection '✅'---");
					const data = await response.json();
					console.log("UserHook:", data);
					if (!data.err){
						console.log("IV: ---User Response '✅'---");
						setUserInfo(data);
					} else {
						console.log("IV: ---User Response '❌'---");
						console.log("UserHook Error:", data.err);
						Cookies.remove('user');
						setAuth(false);
					}
				} else {
					console.log("IV: ---User Backend Connection '❌'---");
					setAuth(false);
				}
			}
			checkUser();
		}
		/* eslint-disable react-hooks/exhaustive-deps */
	}, []);

	if ((isAuth && userInfo === undefined))
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
