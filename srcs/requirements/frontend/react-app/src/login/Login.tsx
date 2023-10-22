import React, { useState, useEffect } from "react";
import Countdown from "./Countdown";
import Client from "../client/Client";

function Login()
{
	const [clientData, setClientData] = useState(null);

	const handleLogin = async (): Promise<any> =>
	{
		const client = new Client();
		const response = await fetch('https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-840bc69f7a7c5c6d788ef6868b85fa537436526f0ad601fcf852d3ebd018cb4d&redirect_uri=http%3A%2F%2F192.168.1.36%3A3000&response_type=code');
		const data = await response.json();

		client.Authenticate(true);
		setClientData(data);
	};

	const redirectToLogin = () =>
	{
		window.location.href = 'https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-840bc69f7a7c5c6d788ef6868b85fa537436526f0ad601fcf852d3ebd018cb4d&redirect_uri=http%3A%2F%2F192.168.1.36%3A3000&response_type=code';
	};

	return (
		<div>
			<div>{Countdown()}</div>
			<button onClick={redirectToLogin}>Login 42</button>
			<p className="c-client-api">Client API: {JSON.stringify(clientData)}</p>
		</div>
	);
}

export default Login;








// import React from "react";
// import Countdown from "./Countdown";


// function	Login()
// {
// 	return (
// 		<div>
// 			<div>{Countdown()}</div>
// 			<button onClick={}>Login 42</button>
// 		</div>
// 	);
// }

// export default	Login;