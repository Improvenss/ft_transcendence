import React, { useEffect, useState } from 'react';
import './Countdown.css'

function Countdown() {
	const [time, setTime] = useState(Date.now());

	useEffect(() =>
	{
		const interval = setInterval(() =>
		{
			setTime(Date.now());
		}, 10);

		return () => clearInterval(interval);
	}, []);

	return (
		<div className="c-countdown">
			<div id="id-countdown">{time}</div>
		</div>
	);
};

export default Countdown;
