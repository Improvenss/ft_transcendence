import React, { useState, useEffect, useRef, KeyboardEvent, ChangeEvent } from "react";
import { useSocket } from '../hooks/SocketHook';
import { log } from "console";
import { Socket } from "socket.io-client";

function	GameInput() {
	const	[value, setValue] = useState("");
	const	maxCharLimit = 1024;
	const	inputRef = useRef<HTMLInputElement>(null);
	const	onGameRoom = localStorage.getItem("onGameRoom") || "none";
	const socket = useSocket();
	useEffect(() => {
		inputRef.current?.focus();
	}, []);
	// ENTER tusuna basildiginda 'gonderilmemesi gereken' kontrolleri burada yapiyoruz.
	// const handleKeyDown = (event: React.KeyboardEvent) => {
	// 	if (event.key === 'Enter') {
	// 		event.preventDefault();
	// 		const trimmedValue = value.replace(/^\s+/, "");
	// 		if (trimmedValue !== "" && trimmedValue.length <= maxCharLimit) {
	// 			send(trimmedValue);
	// 			setValue("");
	// 		}
	// 	}
	// }

	// const	send = (gameRoom: string, value: string) => {
	const	send = (value: string) => {
		const	gameRoom = localStorage.getItem("onGameRoom") || "none";
		console.log("SEND ICI: ", gameRoom);
		socket?.emit("commandGameRoom", { gameRoom: gameRoom, command: value });
		// socket?.emit("commandGameRoom", { gameRoom: gameRoom, command: value });
	}
	
	const handleKeyDown = (event: React.KeyboardEvent) => {
		const pL = document.getElementById("playerLeft");
		event.preventDefault();
		if (pL) {
			var plx = pL.offsetLeft;
			var ply = pL.offsetTop;
			// console.log("GameInput>> " + event.key);
			if (event.key && plx && ply)
			{
				setValue("");
				switch(event.key)
				{
					case 'w':
						console.log("Game: Pressed W");
						send(plx.toString() + " " + ply.toString());
						break;
					case 'ArrowDown':
						console.log("Game: Pressed DOWN");
						send(ply.toString() + "D");
						break;
					case 'ArrowUp':
						console.log("Game: Pressed UP");
						send(ply.toString() + "U");
						break;
					case 'ArrowLeft':
						console.log("Game: Pressed LEFT");
						send(plx.toString() + "L");
						break;
					case 'ArrowRight':
						console.log("Game: Pressed RIGHT");
						send(plx.toString() + "R");
						break;
				}
			}
		}
		else {
			console.log("Game: Player is not finded");
		}
	}

	// SEND butonuna tiklandigindaki 'gonderilmemesi gereken' kontrolleri burada yapiyoruz.
	// const handleClick = () => {
	// 	const trimmedValue = value.replace(/^\s+/, "");
	// 	if (trimmedValue !== "" && trimmedValue.length <= maxCharLimit) {
	// 		send(trimmedValue);
	// 		setValue("");
	// 	}
	// 	inputRef.current?.focus(); // Cursor tekrardan input'a focus olmasi gerek.
	// }
	// const input = document.querySelector("input");
	// input.addEventListener("keypress", logKey);
	return (
		<input
			ref={inputRef}
			className="message-input"
			style={{
			position: 'absolute',
			top: '0px', // Ekranın üstüne yerleştirilecek
			left: '0px',
			}}
			onChange={(e) => setValue(e.target.value)}
			onKeyDown={handleKeyDown}
			maxLength={maxCharLimit}
		/>
	)
}

export default	GameInput;
