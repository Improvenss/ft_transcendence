import React, { createContext, useContext, useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';

// SocketContext'i oluştur
const SocketContext = createContext<Socket | null>(null);

// Provider component'ini oluştur
export function SocketProvider({ children, isAuth }: { children: React.ReactNode, isAuth: boolean }) {
	const [socket, setSocket] = useState<Socket | null>(null);
  
	useEffect(() => {
	  if (isAuth) {
		const newSocket = io(process.env.REACT_APP_SOCKET_HOST as string);
		setSocket(newSocket);
  
		return () => {
		  newSocket.close();
		};
	  }
	}, [isAuth]);
  
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
