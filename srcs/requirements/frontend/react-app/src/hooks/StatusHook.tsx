import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useAuth } from './AuthHook';
import { useSocket } from './SocketHook';
import { useLocation } from 'react-router-dom';

type UserStatus = 'online' | 'offline' | 'in-chat' | 'in-game' | 'afk';

const StatusContext = createContext<{
	status: UserStatus;
}>({
	status: 'online',
});

export function StatusProvider({children}: {children: React.ReactNode}) {
	console.log("---------STATUSHOOK-PAGE---------");
	const isAuth = useAuth().isAuth;
	const socket = useSocket();
	const [status, setStatus] = useState<UserStatus>('online');
	const location = useLocation();
	const statusRef = useRef<UserStatus>('online');

	useEffect(() => {
		if (isAuth) {
			let idleTimer: number;

			const handleVisibilityChange = () => {
				if (document.hidden) {
					// Kullanıcı sayfayı terk etti
					setStatus('afk');
				} else {
					// Kullanıcı sayfaya geri döndü
					setStatus('online');
				}
			};

			const handleInputActivity = () => {
				// Giriş aktivitesi olduğunda zamanlayıcıyı sıfırla
				clearTimeout(idleTimer);
				if (statusRef.current === 'afk'){
					statusRef.current = 'online';
					setStatus('online');
				}
		
				// Belirli bir süre boyunca giriş aktivitesi yoksa durumu 'afk' yap
				idleTimer = window.setTimeout(() => {
					setStatus('afk');
					statusRef.current = 'afk';
				}, 1 * 60 * 1000); // 1 dakika
			};

			// Olay dinleyicilerini ekleyin
			document.addEventListener('visibilitychange', handleVisibilityChange);
			document.addEventListener('keydown', handleInputActivity);
			document.addEventListener('mousemove', handleInputActivity);

			// Olay dinleyicilerini temizleyin
			return () => {
				document.removeEventListener('visibilitychange', handleVisibilityChange);
				document.removeEventListener('keydown', handleInputActivity);
				document.removeEventListener('mousemove', handleInputActivity);
			};
		}
		/* eslint-disable react-hooks/exhaustive-deps */
	}, []);

	useEffect(() => {
		if (isAuth) {

			if (status === 'online' && location.pathname.includes('/chat')) {
				setStatus('in-chat');
			} else if (status === 'online' && location.pathname.includes('/game')) {
				setStatus('in-game');
			} else {
				// socket emit ile kullanıcı statüs'ünü değiştir
				socket?.emit('userStatus', { status: status });
			}
		}
		/* eslint-disable react-hooks/exhaustive-deps */
	}, [status]);

	useEffect(() => {
		if (isAuth){
			if (location.pathname.includes('/chat')){
				setStatus('in-chat');
			} else if (location.pathname.includes('/game')){
				setStatus('in-game');
			} else if (status !== 'online') {
				setStatus('online');
			}
		}
		/* eslint-disable react-hooks/exhaustive-deps */
	}, [location.pathname])

	return (
		<StatusContext.Provider value={{status}}> 
			{children}
		</StatusContext.Provider>
	);
}

export function useStatus(){
	return useContext(StatusContext);
}
