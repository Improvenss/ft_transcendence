import React, { useState } from "react";
import './MessageInput.css';

function	MessageInput({send}: {send: (val: string) => void}) {
	const	[value, setValue] = useState("");
	const maxCharLimit = 1024;

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

	return (
		<div>
			<input
				onChange={(e) => setValue(e.target.value)}
				onKeyDown={handleKeyDown}
				placeholder="Type your message... "
				value={value}
				maxLength={maxCharLimit}></input>
			<button onClick={() => send(value)}>SEND</button>
		</div>
	)
}

export default	MessageInput;
