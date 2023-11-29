import React, { useEffect, useState } from 'react';
import './Countdown.css'

function Countdown() {
	const [time, setTime] = useState(Date.now());

	useEffect(() =>
	{
		const interval = setInterval(() =>
		{
			setTime(Date.now());
		}, 1000);

		return () => clearInterval(interval);
	}, []);

	return (
		<div id="countdown">
			{time}
		</div>
	);
};

export default Countdown;
