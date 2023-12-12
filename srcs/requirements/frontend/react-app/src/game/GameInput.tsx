import React, { useState, useEffect, useRef, KeyboardEvent, ChangeEvent } from "react";
import { useSocket } from '../hooks/SocketHook';
import {useUser} from "../hooks/UserHook";

function	GameInput() {
//function	GameInput({send}: {send: (val: string) => void}) {//<GameInput send={send} />
	const	[value, setValue] = useState("");
	const	maxCharLimit = 1024;
	const	inputRef = useRef<HTMLInputElement>(null);
	const	onGameRoom = localStorage.getItem("onGameRoom") || "none";
	const socket = useSocket();
	const { userInfo } = useUser();
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
		// console.log("SEND ICI: ", gameRoom);
		socket?.emit("commandGameRoom", { gameRoom: gameRoom, command: value });
		// socket?.emit("commandGameRoom", { gameRoom: gameRoom, command: value });
	}
	
	const handleKeyDown = (event: React.KeyboardEvent) => {
		const playerLeft = document.getElementById("playerLeft");
		const playerRight = document.getElementById("playerRight");
		var moveSpeed_slow = 1;
		var moveSpeed_fast = 20;
		event.preventDefault();
		const playerName = userInfo?.login;
		if (playerLeft && playerName == "uercan") {
			var plx = playerLeft.offsetLeft;
			var ply = playerLeft.offsetTop;
			if (event.key)
			{
				// console.log("Box pos: x{" + plx + "}|y{" + ply + "}" + event.key);
				if (event.key == 'ArrowUp')
				{
					// console.log("Game: Pressed UP: " + ply);
					ply -= moveSpeed_fast;
					if (ply < 0)
						ply = 0;
					send( ply.toString() + "U" + playerName );
				}
				else if (event.key == 'ArrowDown')
				{
					// console.log("Game: Pressed Down: " + ply);
					ply += moveSpeed_slow;
					if (ply + playerLeft.offsetHeight > 800)
						ply = 800 - playerLeft.offsetHeight;
					send( ply.toString() + "D" + playerName);
				}
			}
		}
		else if (playerRight) {
			var plx = playerRight.offsetLeft;
			var ply = playerRight.offsetTop;
			if (event.key)
			{
				// console.log("Box pos: x{" + plx + "}|y{" + ply + "}" + event.key);
				if (event.key == 'ArrowUp')
				{
					// console.log("Game: Pressed UP: " + ply);
					ply -= moveSpeed_fast;
					if (ply < 0)
						ply = 0;
					send( ply.toString() + "U" + playerName );
				}
				else if (event.key == 'ArrowDown')
				{
					// console.log("Game: Pressed Down: " + ply);
					ply += moveSpeed_slow;
					if (ply + playerRight.offsetHeight > 800)
						ply = 800 - playerRight.offsetHeight;
					send( ply.toString() + "D" + playerName);
				}
			}
		}
		else {
			console.log("Game: Player is not finded");
		}
	}

	return (
		<input
			ref={inputRef}
			className="message-input"
			style={{
			position: 'absolute',
			}}
			onChange={(e) => setValue(e.target.value)}
			onKeyDown={handleKeyDown}
			maxLength={maxCharLimit}
		/>
	)
}

export default	GameInput;
