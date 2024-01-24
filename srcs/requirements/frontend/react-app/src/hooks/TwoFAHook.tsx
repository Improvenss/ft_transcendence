import React, { createContext, useContext, useEffect, useState } from 'react';
import fetchRequest from '../utils/fetchRequest';
import "./TwoFAHook.css";
import { useUser } from './UserHook';
import Cookies from 'js-cookie';

const TwoFAContext = createContext<{
		isTwoFA: boolean,
	}>({
		isTwoFA: false,
	});

export function TwoFAProvider({ children }: { children: React.ReactNode }) {
	// console.log("---------TWOFAHOOK-PAGE---------");
	const [isTwoFA, setTwoFA] = useState<boolean>(false);
	const [qrCode, setQrCode] = useState<string>('');
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const {userInfo} = useUser();

	useEffect(() => {
		const twoFACookie = Cookies.get('twoFA');
		const checkTwoFA = async () => {
			const response = await fetchRequest({
				method: 'POST',
				body: JSON.stringify({token: twoFACookie}),
				url: `/users/2fa/check`,
			});
			if (response.ok){
				const data = await response.json();
				console.log("checkTwoFA:", data);
				if (!data.err){
					setTwoFA(true);
				} else {
					console.log("checkTwoFA err:", data.err);
				}
			} else {
				console.log("---Backend Connection '❌'---");
			}
		}
		if (userInfo.twoFactorAuthIsEnabled && twoFACookie){
			checkTwoFA();
		}
		/* eslint-disable react-hooks/exhaustive-deps */
	}, []);

	const loginTwoFA = async () => {
		if (qrCode.length !== 6) {
			setErrorMessage('QR Code must be 6 digits long.');
			return;
		}

		console.log("---TwoFA Checking---");
		const response = await fetchRequest({
			method: 'POST',
			body: JSON.stringify({code: qrCode}),
			url: `/users/2fa/login`,
		});
		if (response.ok){
			const data = await response.json();
			console.log("TwoFAHook:", data);
			if (!data.err){
				Cookies.set('twoFA', data.token);
				setTwoFA(true);
			} else {
				console.log("TwoFAHook err:", data.err);
				setErrorMessage(data.err);
			}
		} else {
			console.log("---Backend Connection '❌'---");
		}
	};

	if (userInfo.twoFactorAuthIsEnabled && isTwoFA === false){
		return (
			<div id='twoFA'>
				{errorMessage && <p className="error-message">{errorMessage}</p>}
				<input
					id="two-FAcode"
					type="text"
					name="qrcode"
					onChange={(e) => setQrCode(e.target.value)}
					placeholder="Enter 6 digit code for login..."
				/>
				<button id='enter-2FA' onClick={() => loginTwoFA()}>Enter QR-Code</button>
			</div>
		);
	}

	return (
		<>
			<TwoFAContext.Provider value={{ isTwoFA }}>
				{children}
			</TwoFAContext.Provider>
		</>
	);
}

export function useTwoFA() {
	return useContext(TwoFAContext);
}
