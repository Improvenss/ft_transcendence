// AuthHook.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import LoadingPage from '../utils/LoadingPage';

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
			console.log("I: ---Cookie Checking---");
			const userCookie = Cookies.get("user");
			// const userLStore = localStorage.getItem("user");
			// 'https://localhost/backend/api/cookie' veya /backend/api/cookie
			if (userCookie === undefined)
			{
				console.log("I: ---Cookie Not Found '❌'---");
				setAuth(false);
				return ;
			}
			const response = await fetch(process.env.REACT_APP_API_COOKIE as string, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					"Authorization": "Bearer " + userCookie as string,
				},
			});
			if (response.ok)
			{
				console.log("I: ---Cookie Backend Connection '✅'---");
				const data = await response.json();
				if (data.message === "COOKIE OK") {
					console.log("I: ---Cookie Response '✅'---");
					setAuth(true);
				} else {
					console.log("I: ---Cookie Response '❌'---");
					setAuth(false);
				}
			} else {
				console.log("I: ---Cookie Backend Connection '❌'---");
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
