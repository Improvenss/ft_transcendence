//MatrixRain.tsx
import React, { useEffect, useRef } from 'react';
import './MatrixRain.css';

const MatrixRain: React.FC = () => {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const context = canvas.getContext('2d');
		if (context && canvas){
			const resizeCanvas = () => {
				canvas.height = window.innerHeight;
				canvas.width = window.innerWidth;
			};
			resizeCanvas();

			const katakana = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミ' +
				'リヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレ' +
				'ヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン';
			const latin = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
			const nums = '0123456789';
			const matrixChars = katakana + latin + nums;
			const matrixCharsLength = matrixChars.length;
			const targetFPS = 15; // Hedef FPS değeri
			const frameDelay = 1000 / targetFPS; // İki ardışık çerçeve arasındaki zaman farkı
			let lastFrameTime = 0;
			const generateRandomChar = () => matrixChars[Math.floor(Math.random() * matrixCharsLength)];
			const columns = Math.floor(canvas.width / 15);
			const drops: number[] = [];

			for(let i = 0; i <= columns; i++){ // Sütunları temsil ediyor, sol(0)'dan sağa(max)'a doğru
				drops[i] = 1; // Başlangıçta hangi satırdan başlaması gerektiğini belirtiyoruz.
			}

			const draw = (timestamp: number) => {
				if (timestamp - lastFrameTime < frameDelay) {
					// Belirli FPS'yi aşmadan önce bir sonraki çerçeve için bekle
					requestAnimationFrame(draw);
					return;
				}
				context.fillStyle = 'rgba(0, 0, 0, 0.05)';
				context.fillRect(0, 0, canvas.width, canvas.height);
				context.fillStyle = '#0f0';
				// context.font = `${Math.random()*5 + 10}px monospace`;

				for(let i = 0; i < drops.length; i++) {
					if (drops[i] >= 0 && (drops[i] * 15) <= canvas.height){ // ekran sınırını aşınca bastırma işini bırakacak
						const text = generateRandomChar();
						context.fillText(text, (i * 15), (drops[i] * 15)); // ekrana bastırma işini yapan method
					} else if ((Math.random() > 0.975)) { 
						// Buradaki random koşulu, hangi sütunun drop noktasının 0 olması gerektiğini belirliyor, bu sayede farklı sütunlar ortaya çıkıyor.
						drops[i] = 0; // Yazılar sütunda sınırı aşınca hangi satırdan başlaması gerektiğini belirtiyor. Binevi reset
					}
					drops[i]++;
				}
				lastFrameTime = performance.now();
				requestAnimationFrame(draw); // Bir sonraki çerçeveyi planla
			}
			requestAnimationFrame(draw); // İlk çağrıyı yap
			// const intervalId = setInterval(draw, 100);
			window.addEventListener('resize', resizeCanvas); //ekranın boyutu değişiminde tekrardan setliyor.
			return () => {
				// clearInterval(intervalId);
				window.removeEventListener('resize', resizeCanvas);
			};
		}
	}, []);

	return <canvas ref={canvasRef} id="matrix-rain" />;
};

export default MatrixRain;