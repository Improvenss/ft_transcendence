import React, { useState } from "react";

function	MessageInput({send}: {send: (val: string) => void}) {
	const	[value, setValue] = useState("");
	return (
		<div>
			<input
				onChange={(e) => setValue(e.target.value)}
				placeholder="Type your message... "
				value={value}></input>
			<button onClick={() => send(value)}>SEND</button>
		</div>
	)
}

export default	MessageInput;