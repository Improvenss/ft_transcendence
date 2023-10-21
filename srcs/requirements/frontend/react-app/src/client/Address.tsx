import React, { useEffect, useState } from "react";

function	Address()
{
	// const	[ipAddress, setIpAddress] = useState("Loading...");
	// const	[network, setNetwork] = useState("Loading...");
	// const	[ipApiData, setIpApiData] = useState("Loading...");
	let		[ipAddress, setIpAddress] = useState("");
	let		[network, setNetwork] = useState("");
	let		[ipApiData, setIpApiData] = useState("");
	// const	[ipAddress, setIpAddress] = useState("");
	// const	[network, setNetwork] = useState("");
	// const	[ipApiData, setIpApiData] = useState("");
	const	[loading, setLoading] = useState(true);
	const	[error, setError] = useState(null);

	useEffect(() =>
	{
		fetch("https://ipapi.co/json")
			.then((response) => response.json())
			.then((data) =>
			{
				setIpAddress(data.ip);
				setNetwork(data.network);
				setIpApiData(data);
			})
			.catch((error) => setError(error))
			.finally(() => setLoading(false));
	}, []);

	if (loading)
	{
		ipAddress = "Loading...";
		network = "Loading...";
		ipApiData = "Loading...";
		// return (<p>"Loading..."</p>);
	}
	if (error)
	{
		ipAddress = "Error!";
		network = "Error!";
		ipApiData = "Error!";
		// return (<p>"Error!"</p>);
	}

	return (
		<div className="ip-address">
		<p id="id-public-ip">Your public IP Address: {ipAddress}</p>
		<p>Your IP Network: {network}</p>
		<p>All information; {JSON.stringify(ipApiData, null, 2)}</p>
		</div>
	);
};

export default Address;
