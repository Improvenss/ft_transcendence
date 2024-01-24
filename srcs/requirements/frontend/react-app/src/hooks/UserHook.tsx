import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthHook';
import LoadingPage from '../utils/LoadingPage';
import Cookies from 'js-cookie';
import fetchRequest from '../utils/fetchRequest';
import { IUserProps } from '../chat/iChannel';

const UserContext = createContext<{
	userInfo: IUserProps,
  }>({
	userInfo: {} as IUserProps,
  });

export function UserProvider({children}: {children: React.ReactNode}) {
	// console.log("---------USERHOOK-PAGE---------");
	const {setAuth} = useAuth();
	const [userInfo, setUserInfo] = useState<IUserProps>();

	useEffect(() => {
			const checkUser = async () => {
				const response = await fetchRequest({
					method: 'GET',
					url: `/users?relation=notifications&relation=friends&relation=blockUsers&primary=true`,
				});
				if (response.ok){
					const data = await response.json();
					console.log("UserHook:", data);
					if (!data.err){
						setUserInfo(data);
					} else {
						console.log("---User Response '❌'---");
						console.log("UserHook Error:", data.err);
						Cookies.remove('user');
						setAuth(false);
					}
				} else {
					console.log("---User Backend Connection '❌'---");
					setAuth(false);
				}
			}
			checkUser();
		/* eslint-disable react-hooks/exhaustive-deps */
	}, []);

	if ((userInfo === undefined)){
		return (<LoadingPage />);
	}

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