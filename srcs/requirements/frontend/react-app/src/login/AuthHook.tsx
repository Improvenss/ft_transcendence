// AuthHook.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import LoadingPage from './LoadingPage';

// Create an AuthContext
const AuthContext = createContext<{
		isAuth: boolean;
		setAuth: React.Dispatch<React.SetStateAction<boolean>>;
	}>({
		isAuth: false,
		setAuth: () => {},
	});

// Create the Provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [isAuth, setAuth] = useState(false);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const checkAuth = async () => {
			console.log("I: ---Cookie Checking---");
			const userCookie = Cookies.get("user");
			// const userLStore = localStorage.getItem("user");
			// 'https://localhost/backend/api/cookie' veya /backend/api/cookie
			const response = await fetch(process.env.REACT_APP_API_COOKIE as string, {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
				cookie: userCookie as string
			})
		});

		if (response.ok) {
			console.log("I: ---Cookie Backend Connection '✅'---");
			const data = await response.json();
			if (data.message === "COOKIE OK") {
				console.log("I: ---Cookie Response '✅'---");
				setAuth(true);
			} else {
				console.log("I: ---Cookie Response '❌'---");
			}
		} else {
			console.log("I: ---Cookie Backend Connection '❌'---");
		}
		setLoading(false);
		};

		const fetchData = async () => {
			await checkAuth();
		};
		fetchData();
	}, []);

	if (loading) {
		return (<LoadingPage />);
	}
	return (
		<AuthContext.Provider value={{ isAuth, setAuth }}>
		{children}
		</AuthContext.Provider>
	);
}


// Create the Hook
export function useAuth() {
	return useContext(AuthContext);
}