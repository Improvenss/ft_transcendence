/*
import React, { useEffect, useRef } from 'react';
import './MatrixRain.css';

const MatrixRain: React.FC = () => {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const katakana = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン';
	const latin = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
	const nums = '0123456789';
	const alphabet = katakana + latin + nums;
	const fontSize = 16;

	useEffect(() => {
		const canvas = canvasRef.current;
		if (canvas) {
			const context = canvas.getContext('2d');
			if (context) {
				canvas.width = window.innerWidth;
				canvas.height = window.innerHeight;
				const columns = Math.floor(canvas.width / fontSize);
				const rainDrops: number[] = Array(columns).fill(canvas.height);

				for (let x = 0; x < columns; x++) {
					rainDrops[x] = 1;
				}

				const draw = () => {
					context.fillStyle = 'rgba(0, 0, 0, 0.05)';
					context.fillRect(0, 0, canvas.width, canvas.height);

					context.fillStyle = '#0F0';
					context.font = fontSize + 'px monospace';

					for (let i = 0; i < rainDrops.length; i++) {
						const text = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
						context.fillText(text, i * fontSize, rainDrops[i] * fontSize);

						if (rainDrops[i] * fontSize > canvas.height && Math.random() > 0.975) {
							rainDrops[i] = 0;
						}
						rainDrops[i]++;
					}
				};
				setInterval(draw, 100);
			}
		}
	}, [canvasRef, alphabet]);

	return <canvas ref={canvasRef} className="matrix-rain" />;
};

export default MatrixRain;
*/


import React, { useEffect, useRef } from 'react';
import './MatrixRain.css';

const MatrixRain: React.FC = () => {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
	const canvas = canvasRef.current;	
	if (!canvas) return;
	const context = canvas.getContext('2d');
	if (!context) return;

	const resizeCanvas = () => {
		canvas.height = window.innerHeight;
		canvas.width = window.innerWidth;
	};

	window.addEventListener('resize', resizeCanvas);
	resizeCanvas();

	const katakana = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン';
	const latin = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
	const nums = '0123456789';

	const matrixChars = katakana + latin + nums;//'零0一1二2三3四4五5六6七7八8九9';

	const columns = canvas.width / 15;
	const drops: number[] = [];

	for(let i = 0; i < columns; i++)
		drops[i] = 1;

	function draw() {
		if (context && canvas){
		context.fillStyle = 'rgba(0, 0, 0, 0.05)';
		context.fillRect(0, 0, canvas.width, canvas.height);

		context.fillStyle = '#0f0';
		context.font = '15px';

		for(let i = 0; i < drops.length; i++) {
			const text = matrixChars[Math.floor(Math.random() * matrixChars.length)];

			context.fillText(text, i * 15, drops[i] * 15);

			if(drops[i] * 15 > canvas.height && Math.random() > 0.975)
				drops[i] = 0;
			drops[i]++;
			}
		}
	}

	const intervalId = setInterval(draw, 100);
	return () => {
		clearInterval(intervalId);
		window.removeEventListener('resize', resizeCanvas);
	};
	}, []);

	return <canvas ref={canvasRef} className="matrix-rain" />;
};

export default MatrixRain;
