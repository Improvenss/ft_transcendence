import React, { useState, useEffect } from "react";
import styles from './Login.module.css'
import Countdown from "./Countdown";
import Client from "../client/Client";

/**
 * 
 * 
 * grand_type -> 'authorization_code' olarak kalacak.
 * client_id -> api sayfasindaki UID -> u- ile baslayan.
 * client_secret -> api sayfasindaki SECRET -> s- ile baslayan.
 * code -> https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-4ea96d534d4f392fc0e1c0c8a19eaaaee9faebc6e9ad6f6f374e88eb09c49bc5&redirect_uri=https%3A%2F%2F10.12.14.8%3A80&response_type=code
 * code -> Buradaki yani api sayfasindaki en alltaki link URL.
 * redirect_uri -> api sayfasindaki en alttaki REDIRECT URI kismindaki URI -> https://10.12.14.8:80
 * POST https://api.intra.42.fr/oauth/token -> Bu da "access_token"imizi alabilmek icin kullandigimiz link.
 * 
 * Sonra bu alttaki JSON dosyasi geliyor.
 * 
 *	{"access_token":"b39fb34f2e7a5611323e8294a466498010988110d3cc8125a541b046a272f368","token_type":"bearer","expires_in":7132,"refresh_token":"ebdd6effe8c24cede3ad7c016522a57c5b8c916795e210809242e01e2365fdcd","scope":"public","created_at":1698230661,"secret_valid_until":1699880781}% 

 * Buradan donen access_token ile bizim artik izin verilen kod araciligiyla;
 * 	Benim 42'deki bilgilerimin hepsini almis oluyoruz.
 * Bilgileri JSON formatinda alabilmek icin de;
 * 
 * curl -H "Authorization: Bearer <yukaridaki_POST_isteginden_donen_access_token>" https://api.intra.42.fr/v2/me
 * 
 * ------------------------------------------------
 * 
 * gsever@k2m14s08 ~ % curl -F grant_type='authorization_code' \
	-F client_id=u-s4t2ud-4ea96d534d4f392fc0e1c0c8a19eaaaee9faebc6e9ad6f6f374e88eb09c49bc5 \
	-F client_secret=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 \
	-F code=e20d22cb76c7a0eb28be69383bc1b09bd153b9bcda74a970c3a9500963f0c8fb \
	-F redirect_uri=https://10.12.14.8:80 \
	-X POST https://api.intra.42.fr/oauth/token

	{"access_token":"b39fb34f2e7a5611323e8294a466498010988110d3cc8125a541b046a272f368","token_type":"bearer","expires_in":7132,"refresh_token":"ebdd6effe8c24cede3ad7c016522a57c5b8c916795e210809242e01e2365fdcd","scope":"public","created_at":1698230661,"secret_valid_until":1699880781}%

	sonra bu access_token'i kullanarak;

	gsever@k2m14s08 ~ % curl -H "Authorization: Bearer b39fb34f2e7a5611323e8294a466498010988110d3cc8125a541b046a272f368" https://api.intra.42.fr/v2/me
 * @returns 
 */
function Login()
{
	const redirectToLogin = async () =>
	{
		// window.location.href = process.env.REACT_APP_REDIR_URL as string;
		console.log(process.env.REACT_APP_REDIR_URL);
	};

	return (
		<div>
			<div>{Countdown()}</div>
			<button className={styles.button} onClick={redirectToLogin}>Login 42</button>
		</div>
	);
}

export default Login;


		// const client = new Client();
		// const	form = new FormData();
		// form.append('grant_type', 'authorization_code');
		// form.append('client_id', process.env.REACT_APP_UID as string);
		// form.append('client_secret', process.env.REACT_APP_SECRET as string);
		// form.append('code', intra.code);
		// form.append('redirect_uri', process.env.INTRA_REDIRECT_URI as string);

			// const response = await fetch(process.env.REACT_APP_REDIR_URL as string)
				// .catch(error => console.error(error));
			// const data = await response.json();
			// setClientData(data);
		// client.Authenticate(true);