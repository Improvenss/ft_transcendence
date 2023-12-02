import React, { useState, useEffect, useRef } from "react";
import { useSocket } from "../../hooks/SocketHook";

// function	MessageInput({send}: {send: (val: string) => void}) {
function	MessageInput() {
	const	socket = useSocket();
	const	[value, setValue] = useState("");
	const	maxCharLimit = 1024;
	const	inputRef = useRef<HTMLInputElement>(null);
	const	onChannel = localStorage.getItem("onChannel") || "global";


	// const	send = (value: string) => {
	// 	socket?.emit("createMessage", value);
	// }

	const	send = (channel: string, value: string) => {
		console.log("send'e geldi createMessage:", { channel: channel, message: value });
		socket?.emit("createMessage", { channel: channel, message: value });
	}

	// /chat sayfasi acildigi anda cursor focus'unu direkt input'a yoneltmek icin.
	useEffect(() => {
		inputRef.current?.focus();
	}, []);

	// ENTER tusuna basildiginda 'gonderilmemesi gereken' kontrolleri burada yapiyoruz.
	const handleKeyDown = (event: React.KeyboardEvent) => {
		if (event.key === 'Enter') {
			event.preventDefault();
			const trimmedValue = value.replace(/^\s+/, "");
			if (trimmedValue !== "" && trimmedValue.length <= maxCharLimit) {
				send(onChannel, trimmedValue);
				setValue("");
			}
		}
	}

	// SEND butonuna tiklandigindaki 'gonderilmemesi gereken' kontrolleri burada yapiyoruz.
	const handleClick = () => {
		const trimmedValue = value.replace(/^\s+/, "");
		if (trimmedValue !== "" && trimmedValue.length <= maxCharLimit) {
			send(onChannel, trimmedValue);
			setValue("");
		}
		inputRef.current?.focus(); // Cursor tekrardan input'a focus olmasi gerek.
	}

	return (
		<div id="input-page">
			<input
				ref={inputRef}
				onChange={(e) => setValue(e.target.value)}
				onKeyDown={handleKeyDown}
				placeholder="Type your message... "
				value={value}
				maxLength={maxCharLimit}>
			</input>
			<button
				onClick={handleClick}>SEND
			</button>
		</div>
	)
}

export default	MessageInput;
