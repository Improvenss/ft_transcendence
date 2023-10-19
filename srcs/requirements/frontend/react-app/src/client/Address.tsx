import React, {useEffect, useState } from "react";

function	Address()
{
	const	[ipAddress, setIpAddress] = useState("");
	const	[network, setNetwork] = useState("");
	const	[ipApiData, setipApiData] = useState("");

	// useEffect(() =>
	// {
	// 	fetch("https://ipapi.co/json")
	// 		.then((response) => response.json())
	// 		.then((data) =>
	// 		{
	// 			setIpAddress(data.ip);
	// 			setNetwork(data.network);
	// 		});
	// }, []);
	useEffect(() =>
	{
		fetch("https://ipapi.co/json")
			.then((response) => response.json())
			.then((data) =>
			{
				setIpAddress(data.ip);
				setNetwork(data.network);
				setipApiData(data);
			});
	}, []);


	return (
		<div className="ip-address">
			{/* <p className="ip">Your ip will show here...</p>
			<p className="network">Your network address will show here...</p> */}
			<p>Your public IP Adress: {ipAddress}</p>
			<p>Your IP Network: {network}</p>
			<p>All information; {JSON.stringify(ipApiData, null, 2)}</p>
		</div>
	);
};

export default Address;