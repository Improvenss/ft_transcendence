// FallingChars.tsx

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
		//   const rect = canvas.getBoundingClientRect();
		//   canvas.width = rect.width;
		//   canvas.height = rect.height;
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
	};

		window.addEventListener('resize', resizeCanvas);
		resizeCanvas();

		const katakana = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン';
		const latin = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
		const nums = '0123456789';

		const matrixChars = katakana + latin + nums;

		const columns = canvas.width / 30;
		const drops: {
			x: number;
			y: number;
			speed: number;
			delay: number;
			char: string;
			size: number;
		}[] = [];

		for (let i = 0; i < columns; i++)
			drops[i] = {
				x: i,
				y: Math.random() * canvas.height,
				speed: Math.random() * 0.5 + 1,
				delay: Math.random() * 100,
				char: matrixChars[Math.floor(Math.random() * matrixChars.length)],
				size: Math.random() * 30 + 10,
			};

		function draw() {
			if (context && canvas) {
				context.fillStyle = 'rgba(0, 0, 0, 1)';
				context.fillRect(0, 0, canvas.width, canvas.height);

				context.fillStyle = '#0f0';

				for (let i = 0; i < drops.length; i++) {
					const random = Math.random() * 1;
					const fontSize = drops[i].size + '15px monospace';
					context.font = fontSize;
					const textWidth = context.measureText(drops[i].char).width;
					context.fillText(
						drops[i].char,
						drops[i].x * 30 - textWidth / 2,
						drops[i].y
					);

					if (drops[i].y > canvas.height)
						drops[i] = {
							x: i,
							y: 0,
							speed: random * 0.1 + 1,
							delay: random * 100,
							char: matrixChars[Math.floor(Math.random() * matrixChars.length)],
							size: random * 30 + 10,
						};
					else drops[i].y += drops[i].speed;

					if (random < 0.01) {
						drops[i].char = matrixChars[Math.floor(Math.random() * matrixChars.length)];
					}
				}
			}
		}

		const fps = 15;
		const intervalId = setInterval(draw, 1000 / fps);
		return () => {
			clearInterval(intervalId);
			window.removeEventListener('resize', resizeCanvas);
		};
	}, []);

	return <canvas ref={canvasRef} id="matrix-rain" />;
};

export default FallingChars;

/*
import React, { useEffect, useRef } from 'react';

const FallingCharacters: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const katakana = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン';
    const latin = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const nums = '0123456789';
    const characters = katakana + latin + nums;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    const fallingCharacters: {
	  [x: string]: any;
      position: { x: number; y: number };
      speed: number;
      column: number;
      char: string;
      size: number;
    }[] = [];

    const targetFPS = 60;
    const frameDelay = 1000 / targetFPS;
    let lastFrameTime = 0;
	
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	const width = window.innerWidth;
	const height = window.innerHeight;


    const minOpacity = 0.2;
    const maxOpacity = 1;

    function getRandomCharacter() {
      return characters[Math.floor(Math.random() * characters.length)];
    }
    class FallingCharacter {
      position = { x: Math.random() * width, y: Math.random() * height };
      speed = Math.random() * 1 + 0;
      column = Math.random() * width;
      char = getRandomCharacter();
      size = Math.random() * 10 + 10;

      fall() {
        this.position.y += this.speed;
        if (this.position.y >= height) {
          this.position.y = 0;
          this.speed = 1;
          this.column = Math.random() * width;
          this.char = getRandomCharacter();
        }
      }

      draw() {
        const distanceFromBottom = height - this.position.y;
        const normalizedDistance = distanceFromBottom / height;
        const opacity = minOpacity + (maxOpacity - minOpacity) * normalizedDistance;
		if (!context) return;
        context.fillStyle = `rgba(0, 255, 0, ${opacity})`;
        context.font = `${this.size}px monospace`;
        context.fillText(this.char, this.column - this.size / 2, this.position.y);
      }
    }

    function animate(currentTime: number) {
		requestAnimationFrame(animate);

		if (currentTime - lastFrameTime < frameDelay) return;

		lastFrameTime = currentTime;
		if (!context) return;
		context.clearRect(0, 0, width, height);

		fallingCharacters.forEach((character) => {
			character.fall();
			character.draw();
		});
    }

    const characterCount = 20;

    // for (let i = 0; i < characterCount; i++)
	fallingCharacters.push(new FallingCharacter());

    animate(0);
  }, []);

  return <canvas ref={canvasRef} id="matrix-rain"></canvas>;
};

export default FallingCharacters;
*/