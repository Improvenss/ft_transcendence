import React, { createContext, useContext, useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';
import { useAuth } from './AuthHook';
import LoadingPage from '../utils/LoadingPage';
import { useUser } from './UserHook';

// SocketContext'i oluştur
const SocketContext = createContext<Socket | undefined>(undefined);

// Provider component'ini oluştur
export function SocketProvider({ children }: { children: React.ReactNode }) {
	console.log("---------SOCKETHOOK-PAGE---------");
	const {isAuth} = useAuth();
	const {userInfo} = useUser();
	const [socket, setSocket] = useState<Socket | undefined>(undefined);

	useEffect(() => {
		if (isAuth && userInfo && socket === undefined) {
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
