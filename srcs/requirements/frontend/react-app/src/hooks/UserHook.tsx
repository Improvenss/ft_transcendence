import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthHook';
import LoadingPage from '../utils/LoadingPage';
import Cookies from 'js-cookie';
import { useSocket } from './SocketHook';

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

interface IUserProps{
	email: string,
	login: string,
	displayname: string,
	imageUrl: string,
	socketId: string,
	status: string,
	nickname: string,
	avatar: string,
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
	const {isAuth, setAuth} = useAuth();
	const socket = useSocket();
	const userCookie = Cookies.get("user");
	const [userInfo, setUserInfo] = useState<IUserProps | undefined>(undefined);

	useEffect(() => {
		if (isAuth === true){
			const checkUser = async () => {
				console.log("IV: ---User Checking---");
				const response = await fetch(process.env.REACT_APP_FETCH + `/users?relation=friends&relation=notifications&primary=true`, {
					method: "GET",
					headers: {
						"Content-Type": "application/json",
						"Authorization": "Bearer " + userCookie as string,
					},
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
	}, [socket, isAuth]);

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
