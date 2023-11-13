import React, { useEffect, useRef } from "react";

function	Message({messages}: {messages: string[]}) {
	const	messagesEndRef = useRef<HTMLDivElement>(null);
	console.log("ekrana koyarken--->>>:" + messages);

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	return (
		<div>
			{messages.map((message, index) => (
				// <p key={index}>{message.login}: {message.message}</p>
				<p key={index}>{index}: {message}</p>
			))}
			<div ref={messagesEndRef} />
		</div>
	);
}

export default	Message;