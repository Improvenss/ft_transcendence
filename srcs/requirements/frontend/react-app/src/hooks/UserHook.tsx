import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthHook';
import LoadingPage from '../utils/LoadingPage';
import Cookies from 'js-cookie';
import { useSocket } from './SocketHook';

interface INotfis {
	id: number,
	text: string,
	date: Date,
	read: boolean,
}

interface IUserProps{
	email: string;
	login: string;
	displayname: string;
	imageUrl: string;
	socketId?: string;
	nickname?: string;
	avatar?: string;
	status: string;
	friends: IUserProps[];
	notifications: INotfis[];
}

const UserContext = createContext<{
	userInfo: IUserProps | undefined;
  }>({
	userInfo: undefined,
  });

export function UserProvider({children}: {children: React.ReactNode}) {
	console.log("---------USERHOOK-PAGE---------");
	const isAuth = useAuth().isAuth;
	const socket = useSocket();
	const userCookie = Cookies.get("user");
	const [userInfo, setUserInfo] = useState<IUserProps | undefined>(undefined);

	useEffect(() => {
		if (isAuth === true){
			const checkUser = async () => {
				console.log("IV: ---User Checking---");
				//const response = await fetch(process.env.REACT_APP_USER as string, {
				// const response = await fetch(process.env.REACT_APP_FETCH + `/users/user?user=me&relations=friends`, {
				const response = await fetch(process.env.REACT_APP_FETCH + `/users/user?user=me&relations=friends&relations=notifications`, {
					method: "GET",
					headers: {
						"Content-Type": "application/json",
						"Authorization": "Bearer " + userCookie as string,
					},
				});
				if (response.ok){
					console.log("IV: ---User Backend Connection '✅'---");
					const data = await response.json();
					if (data.message === 'USER OK'){
						console.log("IV: ---User Response '✅'---");
						setUserInfo({
							email: data.user.email,
							login: data.user.login,
							displayname: data.user.displayname,
							imageUrl: data.user.imageUrl,
							socketId: data.user.socketId,
							nickname: data.user.nickname,
							avatar: data.user.avatar,
							status: data.user.status,
							friends: data.user.friends,
							notifications: data.user.notifications,
						});
						console.log("userInfo:", data.user);

					} else {
						console.log("IV: ---User Response '❌'---");
						Cookies.remove('user');
					}
				} else {
					console.log("IV: ---User Backend Connection '❌'---");
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
