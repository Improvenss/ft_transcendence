import React, { useState, useEffect, useRef } from 'react';

const BallMechanic: React.FC = () => {
//function	GameInput({send}: {send: (val: string) => void}) {//<GameInput send={send} />
const [ballSpeed, setBallSpeed] = useState({ x: 8, y: 8 });
const containerRef = React.useRef<HTMLDivElement>(null);
const [ballPosition, setBallPosition] = useState({ x: 100, y: 100 });
	// const playerLeft = useRef<HTMLDivElement>(null);
	const getRandomSpeed = () => {
		const speed = Math.random() * 10; // 4 ile 8 arasında rastgele bir hız
		const direction = Math.random() < 0.5 ? 1 : -1; // Rastgele pozitif veya negatif yönde
		return { x: speed * direction, y: speed * direction };
	};
	useEffect(() => {

		// setBallSpeed(getRandomSpeed());

		const gameLoop = setInterval(() => {
			const playerLeft = document.getElementById("playerLeft");
			const playerRight = document.getElementById("playerRight");
			var	newBallX = ballPosition.x + ballSpeed.x;
			var	newBallY = ballPosition.y + ballSpeed.y;
			if (containerRef.current)
			{
				const containerWidth = containerRef.current.clientWidth;
				const containerHeight = containerRef.current.clientHeight;
				if (newBallX <= 0)
					{
						const rightScore = document.getElementById("rightScore");
						if (rightScore?.textContent)
						{
							let currentScore = parseInt(rightScore.textContent, 10);
							currentScore++;
							if (currentScore < 10)
								rightScore.textContent = "0" + currentScore.toString();
							else
								rightScore.textContent = currentScore.toString();
						}
						setBallSpeed((prevSpeed) => ({ ...prevSpeed, x: -prevSpeed.x }));
						newBallX = 500;
						newBallY = 350;
					}
					if (newBallX >= containerWidth)
					{
						const leftScore = document.getElementById("leftScore");
						if (leftScore?.textContent)
						{
							let currentScore = parseInt(leftScore.textContent, 10);
							currentScore++;
							if (currentScore < 10)
								leftScore.textContent = "0" + currentScore.toString();
							else
								leftScore.textContent = currentScore.toString();
						}
						setBallSpeed((prevSpeed) => ({ ...prevSpeed, x: -prevSpeed.x }));
						newBallX = 500;
						newBallY = 350;
					}
					//--------------------------------------------------------------------------
					if (newBallY <= 0 || newBallY >= containerHeight) {
						// Ekranın üst veya alt tarafına çarptı, y hızını tersine çevir
						setBallSpeed((prevSpeed) => ({ ...prevSpeed, y: -prevSpeed.y }));
					}

					// Topun yeni konumunu ve hızını ayarla
					setBallPosition({ x: newBallX, y: newBallY });
			}
			if (playerLeft)
			{
				// if (containerRef.current) {
					// const containerWidth = containerRef.current.clientWidth;
					// const containerHeight = containerRef.current.clientHeight;

					// Topun yeni konumunu hesapla
					
					//Oyuncuyla aynı hizada (x) olması-----------------
					if (newBallX + 30 <= playerLeft.offsetLeft + playerLeft.offsetWidth)
					{
						//aynı
						if (newBallY + 30 >= playerLeft.offsetTop &&
							newBallY + 30 <= playerLeft.offsetTop + playerLeft.offsetHeight)
						{
							setBallSpeed((prevSpeed) => ({ ...prevSpeed, x: -prevSpeed.x }));
						}
					}
					setBallPosition({ x: newBallX, y: newBallY });
				// }
			}else
			console.log("Ball is not finded the player");
			if (playerRight)
			{
				if (newBallX + 30 >= playerRight.offsetLeft)
					{
						if (newBallY + 30 >= playerRight.offsetTop &&
							newBallY + 30 <= playerRight.offsetTop + playerRight.offsetHeight)
						{
							setBallSpeed((prevSpeed) => ({ ...prevSpeed, x: -prevSpeed.x }));
						}
					}
					setBallPosition({ x: newBallX, y: newBallY });
			}
			else
				console.log("Ball is not finded the player");
		}, 16); // 60 FPS için

		// Temizlik
		return () => clearInterval(gameLoop);
	}, [ballPosition, ballSpeed]);

	return (
		<div
			ref={containerRef}
			style={{
				position: 'absolute',
				width: '1000px',
				height: '800px',
				border: '1px solid #ccc',
				overflow: 'hidden',
			}}
		>
			<div
				id="ballMechanic"
				style={{
					position: 'absolute',
					left: `${ballPosition.x}px`,
					top: `${ballPosition.y}px`,
					width: '60px',
					height: '60px',
					backgroundColor: '#ccc',
					borderRadius: '50%',
				}}
			></div>
		</div>
	);
};

export default BallMechanic;
