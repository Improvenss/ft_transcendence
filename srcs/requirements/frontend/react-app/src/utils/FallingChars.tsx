// FallingChars.tsx

import React, { useEffect, useRef } from 'react';
import './MatrixRain.css';

const FallingChars: React.FC = () => {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const context = canvas.getContext('2d');
		if (context && canvas){
			const resizeCanvas = () => {
				canvas.width = window.innerWidth;
				canvas.height = window.innerHeight;
			};
			resizeCanvas();

			const katakana = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミ' +
				'リヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレ' +
				'ヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン';
			const latin = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
			const nums = '0123456789';

			const matrixChars = katakana + latin + nums;
			const matrixCharsLength = matrixChars.length;
			const generateRandomChar = () => matrixChars[Math.floor(Math.random() * matrixCharsLength)];

			const columns = Math.floor(canvas.width / 30);
			const drops: {
				x: number;
				y: number;
				speed: number;
				delay: number;
				char: string;
				size: number;
				restart: boolean,
			}[] = [];

			for (let i = 0; i <= columns; i++){
				drops[i] = {
					x: i,
					y: Math.random() * canvas.height,
					speed: Math.random() * 0.5 + 1,
					delay: Math.random() * 100,
					char: generateRandomChar(),
					size: Math.random() * 30 + 5,
					restart: false,
				};
			}

			const draw = () => {
				context.fillStyle = 'rgba(0, 0, 0, 1)';
				context.fillRect(0, 0, canvas.width, canvas.height);
				context.fillStyle = '#0f0';

				for (let i = 0; i < drops.length; i++) {
					const random = Math.random();
					if (drops[i].restart === false){
						drops[i].y += drops[i].speed;
						if (drops[i].y > canvas.height)
							drops[i].restart = true;

						context.font = `${drops[i].size}px monospace`;
						const textWidth = context.measureText(drops[i].char).width; //Bastırılan önceki karakterin pozisyonu
						context.fillText(
							drops[i].char,
							(drops[i].x * 30) - textWidth,
							drops[i].y
						); // Ekrana bastırma işlemini gerçekleştiriyor.

						if (random < 0.01) { // Karakterleri random olarak değiştiriyor.
							drops[i].char = generateRandomChar();
						}
						continue;
					}

					if (random > 0.100){
						drops[i] = {
							x: i,
							y: 0,
							speed: (random * 0.1) + 1,
							delay: (random * 100),
							char: generateRandomChar(),
							size: (random * 30) + 10,
							restart: false,
						};
					}
				}
			}

			const fps = 15;
			const intervalId = setInterval(draw, 1000 / fps);
			window.addEventListener('resize', resizeCanvas);
			return () => {
				clearInterval(intervalId);
				window.removeEventListener('resize', resizeCanvas);
			};
		}
	}, []);

	return <canvas ref={canvasRef} id="matrix-rain" />;
};

export default FallingChars;

/*
import React, { useEffect, useRef } from 'react';

// interface FallingCharacter {
// 	position: { x: number; y: number };
// 	speed: number;
// 	column: number;
// 	char: string;
// 	size: number;
// }

const FallingCharacters: React.FC = () => {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const katakana = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミ' +
			'リヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレ' +
			'ヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン';
		const latin = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
		const nums = '0123456789';
		const matrixChars = katakana + latin + nums;
		const matrixCharsLength = matrixChars.length;
		function randomIndex(): number { return (Math.floor(Math.random() * matrixCharsLength))};

		const canvas = canvasRef.current;
		if (!canvas) return;

		const context = canvas.getContext('2d');
		if (!context) return;

		const resizeCanvas = () => {
			canvas.height = window.innerHeight;
			canvas.width = window.innerWidth;
		};
		resizeCanvas();
		const width = window.innerWidth; // Setleyip bunu kullandığımız için ekran değişiminde karakter bastırmada problem çıkmıyor.
		const height = window.innerHeight;

		const fallingCharacters: FallingCharacter[] = [];
		const targetFPS = 30;
		const frameDelay = 1000 / targetFPS;
		const characterCount = 20;
		const minOpacity = 0.2;
		const maxOpacity = 1;
		let lastFrameTime = 0;

		class FallingCharacter {
			position = { x: Math.random() * width, y: Math.random() * height };
			speed = Math.random() * 1 + 0;
			column = Math.random() * width;
			char = matrixChars[randomIndex()];
			size = Math.random() * 10 + 10;

			fall() {
				this.position.y += this.speed;
				if (this.position.y >= height) {
					this.position.y = 0;
					this.speed = 1;
					this.column = Math.random() * width;
					this.char = matrixChars[randomIndex()];
				}
			}

			draw() {
				if (!context) return;
				const distanceFromBottom = height - this.position.y;
				const normalizedDistance = distanceFromBottom / height;
				const opacity = minOpacity + (maxOpacity - minOpacity) * normalizedDistance;
				context.fillStyle = `rgba(0, 255, 0, ${opacity})`;
				context.font = `${this.size}px monospace`;
				context.fillText(this.char, this.column - this.size / 2, this.position.y);
			}
		}

		function animate(currentTime: number) {
			requestAnimationFrame(animate);
			if (currentTime - lastFrameTime < frameDelay)
				return;

			lastFrameTime = currentTime;
			if (!context) return;
			context.clearRect(0, 0, width, height);

			fallingCharacters.forEach((character) => {
				character.fall();
				character.draw();
			});
		}

		for (let i = 0; i < characterCount; i++){
			fallingCharacters.push(new FallingCharacter());
		}

		animate(0);
		window.addEventListener('resize', resizeCanvas); //ekranın boyutu değişiminde tekrardan setliyor.
		return () => {
			window.removeEventListener('resize', resizeCanvas);
		};
	}, []);

	return <canvas ref={canvasRef} id="matrix-rain"></canvas>;
};

export default FallingCharacters;
*/