import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthHook';
import LoadingPage from '../utils/LoadingPage';
import Cookies from 'js-cookie';
import fetchRequest from '../utils/fetchRequest';

export interface INotif {
	id: number,
	type: 'text' | 'sendFriendRequest' | 'acceptFriendRequest' | 'declineFriendRequest',
	// type: string,
	text: string,
	date: string,
	// date: Date,
	read: boolean,
	from: string,
}

export interface IUserProps{
	id: number,
	email: string,
	login: string,
	displayname: string,
	imageUrl: string,
	socketId: string,
	status: string,
	nickname?: string,
	avatar?: string,
	friends: IUserProps[],
	notifications: INotif[],
}

const UserContext = createContext<{
	userInfo: IUserProps | undefined;
  }>({
	userInfo: undefined,
  });

export function UserProvider({children}: {children: React.ReactNode}) {
	console.log("---------USERHOOK-PAGE---------");
	const {isAuth} = useAuth();
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
					}
				} else {
					console.log("IV: ---User Backend Connection '❌'---");
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
