import React, { createContext, useContext, useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';
import { useAuth } from '../login/AuthHook';
import Cookies from 'js-cookie';
import LoadingPage from '../login/LoadingPage';

// SocketContext'i oluştur
const SocketContext = createContext<Socket | null>(null);

// Provider component'ini oluştur
export function SocketProvider({ children }: { children: React.ReactNode }) {
	const [socket, setSocket] = useState<Socket | null>(null);
	const isAuth = useAuth().isAuth;
	const userCookie = Cookies.get("user");
	const [loading, setLoading] = useState(true);

	useEffect(() => {

		if (isAuth) {
			const newSocket = io(process.env.REACT_APP_SOCKET_HOST as string);
			setSocket(newSocket);
			newSocket.on('connect', async () => {
				console.log('Client connected to Server. ✅');
				const response = await fetch(process.env.REACT_APP_HOST + '/users/socket', {
					method: "POST",
					headers: {
						"Content-Type": "application/json"
					},
					body: JSON.stringify({
						cookie: userCookie as string,
						socketID: {
							socket_id: newSocket.id as string
						}
					})
				})
				if (response.ok)
				{
					console.log("Socket update:", await response.json());
				}
				setLoading(false);
			});
			newSocket.on('disconnect', () => {
				console.log('Client connection lost. 💔');
			});
			return () => {
				newSocket.close();
			};
		}
		setLoading(false);
	}, [isAuth]);

	if (loading) {
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
