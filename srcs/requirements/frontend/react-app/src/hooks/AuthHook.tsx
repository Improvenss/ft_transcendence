// AuthHook.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import LoadingPage from '../utils/LoadingPage';
import fetchRequest from '../utils/fetchRequest';

// Create an AuthContext
const AuthContext = createContext<{
		isAuth: boolean | undefined;
		setAuth: React.Dispatch<React.SetStateAction<boolean | undefined>>;
	}>({
		isAuth: undefined,
		setAuth: () => {},
	});

// Create the Provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
	console.log("---------AUTHHOOK-PAGE---------");
	const [isAuth, setAuth] = useState<boolean | undefined>(undefined);

	useEffect(() => {
		const checkAuth = async () => {
			try {
				const userCookie = Cookies.get("user");
				// const userLStore = localStorage.getItem("user");
				if (userCookie === undefined)
					throw new Error("---Cookie Not Found '❌'---");
				const response = await fetchRequest({
					method: 'GET',
					url: '/users/cookie',
				});
				if (response.ok) {
					const data = await response.json();
					if (!data.err){
						console.log("AuthHook:", data);
						setAuth(true);
					} else {
						throw new Error(data.err);
					}
				} else {
					throw new Error("---Cookie Backend Connection '❌'---");
				}
			} catch (err) {
				if (err instanceof Error) {
					console.log("AuthHook err:", err.message);
				}
				Cookies.remove('user');
				setAuth(false);
			}
		};
		checkAuth();
	}, []);

	if (isAuth === undefined)
		return (<LoadingPage />)

	return (
		<>
			<AuthContext.Provider value={{ isAuth, setAuth }}>
				{children}
			</AuthContext.Provider>
		</>
	);
}

// Create the Hook
export function useAuth() {
	return useContext(AuthContext);
}