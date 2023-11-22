//FallingChars.tsx
import React, { useEffect, useRef } from 'react';
import './MatrixRain.css';

const FallingChars: React.FC = () => {
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

		const matrixChars = katakana + latin + nums;

		const columns = canvas.width / 30;
		const drops: {x: number, y: number, speed: number, delay: number, char: string, size: number}[] = [];

		for(let i = 0; i < columns; i++)
			drops[i] = {x: i, y: Math.random() * canvas.height, speed: Math.random() * 0.5 + 1, delay: Math.random() * 100, char: matrixChars[Math.floor(Math.random() * matrixChars.length)], size: Math.random() * 20 + 10};

		let frameCount = 0;
		function draw() {
			if (context && canvas){
				context.fillStyle = 'rgba(0, 0, 0)';
				context.fillRect(0, 0, canvas.width, canvas.height);

				context.fillStyle = '#0f0';

				for(let i = 0; i < drops.length; i++) {
					context.font = drops[i].size + 'px monospace';
					context.fillText(drops[i].char, drops[i].x * 30, drops[i].y);

					if(drops[i].y > canvas.height)
						drops[i] = {x: i, y: 0, speed: Math.random() * 0.5 + 1, delay: Math.random() * 100, char: matrixChars[Math.floor(Math.random() * matrixChars.length)], size: Math.random() * 1 + 30};
					else
						drops[i].y += drops[i].speed;

					if(frameCount % 100 === 0)
						drops[i].char = matrixChars[Math.floor(Math.random() * matrixChars.length)];
				}
			}
			frameCount++;
		}

		const intervalId = setInterval(draw, 50);
		return () => {
			clearInterval(intervalId);
			window.removeEventListener('resize', resizeCanvas);
		};
	}, []);

	return <canvas ref={canvasRef} className="matrix-rain" />;
};

export default FallingChars;

/*
import React, { useEffect, useRef } from 'react';
import './MatrixRain.css';

const FallingChars: React.FC = () => {
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

		const matrixChars = katakana + latin + nums;

		const columns = canvas.width / 15;
		const drops: {x: number, y: number, speed: number, delay: number, char: string, size: number}[] = [];

		for(let i = 0; i < columns; i++)
			drops[i] = {x: i, y: Math.random() * canvas.height, speed: Math.random() * 0.5 + 1, delay: Math.random() * 100, char: matrixChars[Math.floor(Math.random() * matrixChars.length)], size: Math.random() * 20 + 10};

		function draw() {
			if (context && canvas){
				context.fillStyle = 'rgba(0, 0, 0)';
				context.fillRect(0, 0, canvas.width, canvas.height);

				context.fillStyle = '#0f0';

				for(let i = 0; i < drops.length; i++) {
					context.font = drops[i].size + 'px monospace';
					context.fillText(drops[i].char, drops[i].x * 15, drops[i].y);

					if(drops[i].y > canvas.height)
						drops[i] = {x: i, y: 0, speed: Math.random() * 0.5 + 1, delay: Math.random() * 100, char: matrixChars[Math.floor(Math.random() * matrixChars.length)], size: Math.random() * 1 + 30};
					else
						drops[i].y += drops[i].speed;
				}
			}
		}

		const intervalId = setInterval(draw, 10);
		return () => {
			clearInterval(intervalId);
			window.removeEventListener('resize', resizeCanvas);
		};
	}, []);

	return <canvas ref={canvasRef} className="matrix-rain" />;
};

export default FallingChars;
*/