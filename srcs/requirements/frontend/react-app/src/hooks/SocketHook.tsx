import React, { createContext, useContext, useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';
import LoadingPage from '../utils/LoadingPage';
import { useUser } from './UserHook';
import { useAuth } from './AuthHook';

// SocketContext'i oluştur
const SocketContext = createContext<{
	socket: Socket,
}>({
	socket: {} as Socket,
});

// Provider component'ini oluştur
export function SocketProvider({ children }: { children: React.ReactNode }) {
	console.log("---------SOCKETHOOK-PAGE---------");
	const [socket, setSocket] = useState<Socket>();
	const {userInfo} = useUser();
	const {setAuth} = useAuth();

	useEffect(() => {
		const newSocket = io(process.env.REACT_APP_SOCKET_HOST as string, {
			query: {
				id: userInfo.id,
			},
		});
		newSocket.on('connect', () => {
			console.log('Client connected to Server. ✅');
			setSocket(newSocket);
		});
		newSocket.on('disconnect', (reason) => {
			console.log(`Client connection lost. 💔 Reason: ${reason}`);
			setSocket(undefined);
		});
		// newSocket.on('error', (error) => {
		// 	console.error('WebSocket Error:', error);
		// });
		// newSocket.on(`userId-${userInfo.id}`, handleListenAction);
		return () => {
			// newSocket.off(`userId-${userInfo.id}`, handleListenAction);
			if (newSocket.connected){
				newSocket.disconnect();
			}
		};
		/* eslint-disable react-hooks/exhaustive-deps */
	}, []);

	if ((socket === undefined)) {
		return (<LoadingPage />);
	}

	return (
		<SocketContext.Provider value={{socket}}>
			{children}
		</SocketContext.Provider>
	);
}

// Hook'u oluştur
export function useSocket() {
	return useContext(SocketContext);
}
