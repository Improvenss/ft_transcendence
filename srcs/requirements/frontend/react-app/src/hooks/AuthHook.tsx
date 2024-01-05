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
				console.log("I: ---Cookie Checking---");
				const userCookie = Cookies.get("user");
				// const userLStore = localStorage.getItem("user");
				if (userCookie === undefined)
				{
					console.log("I: ---Cookie Not Found '❌'---");
					setAuth(false);
					return ;
				}
				const response = await fetchRequest({
					method: 'GET',
					url: '/users/cookie',
				});
				if (response.ok) {
					console.log("I: ---Cookie Backend Connection '✅'---");
					const data = await response.json();
					console.log("AuthHook:", data);
					setAuth((!data.err));
				} else {
					console.log("I: ---Cookie Backend Connection '❌'---");
					Cookies.remove('user');
					setAuth(false);
				}
			} catch (err) {
				console.log("AuthHook err:", err);
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
