import React, { createContext, useContext, useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';
import { useAuth } from './AuthHook';
import LoadingPage from '../utils/LoadingPage';
import fetchRequest from '../utils/fetchRequest';
import Cookies from 'js-cookie';

// SocketContext'i oluştur
const SocketContext = createContext<Socket | undefined>(undefined);

// Provider component'ini oluştur
export function SocketProvider({ children }: { children: React.ReactNode }) {
	console.log("---------SOCKETHOOK-PAGE---------");
	const isAuth = useAuth().isAuth;
	const [socket, setSocket] = useState<Socket | undefined>(undefined);
	const userCookie = Cookies.get("user");

	useEffect(() => {
		if (isAuth) {
			const newSocket = io(process.env.REACT_APP_SOCKET_HOST as string);
			newSocket.on('connect', async () => {
				console.log('Client connected to Server. ✅');
				const response = await fetchRequest({
					method: 'PATCH',
					body: JSON.stringify({ socketId: newSocket.id as string }),
					url: '/users/socket',
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
		/* eslint-disable react-hooks/exhaustive-deps */
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
