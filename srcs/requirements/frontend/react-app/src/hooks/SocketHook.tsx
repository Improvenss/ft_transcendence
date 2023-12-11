import React, { createContext, useContext, useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';
import { useAuth } from './AuthHook';
import Cookies from 'js-cookie';
import LoadingPage from '../utils/LoadingPage';

// SocketContext'i oluştur
const SocketContext = createContext<Socket | undefined>(undefined);

// Provider component'ini oluştur
export function SocketProvider({ children }: { children: React.ReactNode }) {
	console.log("---------SOCKETHOOK-PAGE---------");
	const isAuth = useAuth().isAuth;
	const userCookie = Cookies.get("user");
	const [socket, setSocket] = useState<Socket | undefined>(undefined);

	useEffect(() => {
		if (isAuth) {
			const newSocket = io(process.env.REACT_APP_SOCKET_HOST as string);
			newSocket.on('connect', async () => {
				console.log('Client connected to Server. ✅');
				const response = await fetch(process.env.REACT_APP_SOCKET as string, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						"Authorization": "Bearer " + userCookie as string,
					},
					body: JSON.stringify({
						socketId: newSocket.id as string,
					})
				})
				if (response.ok)
				{
					console.log("Socket update:", await response.json());
					setSocket(newSocket);
				}
			});
			newSocket.on('disconnect', () => {
				console.log('Client connection lost. 💔');
				setSocket(undefined);
			});
			return () => {
				newSocket.close();
			};
		}
	}, [isAuth]); //isAuth'un güncellenmesini bekliyor, eğer güncellenmesse olmassa loadingPage görüntülenir sürekli

	if ((isAuth && socket === undefined) || (!isAuth && socket)) {
		return (<LoadingPage />);
	}

	return (
		<SocketContext.Provider value={socket}>
			{children}
		</SocketContext.Provider>
	);
}

// Hook'u oluştur
export function useSocket() {
	return useContext(SocketContext);
}
