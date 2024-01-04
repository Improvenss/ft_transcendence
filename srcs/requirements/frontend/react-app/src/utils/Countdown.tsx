/*
import React, { useEffect, useRef } from 'react';
import './Countdown.css';

function Countdown() {
	const countdownRef = useRef<HTMLDivElement | null>(null);
	const fps = 60;
	const frameDelay = 1000 / fps;
	let lastTimestamp = 0;

	const updateCountdown = (timestamp: number) => {
		const elapsed = timestamp - lastTimestamp;

		if (elapsed > frameDelay) {
			lastTimestamp = timestamp;

			if (countdownRef.current) {
				countdownRef.current.textContent = Date.now().toString();
			}
		}
		requestAnimationFrame(updateCountdown);
	};

	useEffect(() => {
		requestAnimationFrame(updateCountdown);
		return () => cancelAnimationFrame(0);
	}, []);

	return (
		<div id="countdown" ref={countdownRef}/>
	);
}

export default Countdown;
*/

import React, { useEffect, useState } from 'react';
import './Countdown.css'

function Countdown() {
	const [time, setTime] = useState(Date.now());

	useEffect(() => {
		const interval = setInterval(() => {
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