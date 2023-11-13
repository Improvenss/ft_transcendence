import React, { useState, useEffect, useRef } from "react";
import './MessageInput.css';

function	MessageInput({send}: {send: (val: string) => void}) {
	const	[value, setValue] = useState("");
	const	maxCharLimit = 1024;
	const	inputRef = useRef<HTMLInputElement>(null);

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
				send(trimmedValue);
				setValue("");
			}
		}
	}

	// SEND butonuna tiklandigindaki 'gonderilmemesi gereken' kontrolleri burada yapiyoruz.
	const handleClick = () => {
		const trimmedValue = value.replace(/^\s+/, "");
		if (trimmedValue !== "" && trimmedValue.length <= maxCharLimit) {
			send(trimmedValue);
			setValue("");
		}
	}

	return (
		<div>
			<input
				ref={inputRef}
				onChange={(e) => setValue(e.target.value)}
				onKeyDown={handleKeyDown}
				placeholder="Type your message... "
				value={value}
				maxLength={maxCharLimit}></input>
			<button onClick={handleClick}>SEND</button>
		</div>
	)
}

export default	MessageInput;
