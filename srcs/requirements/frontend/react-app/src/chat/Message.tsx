import React, { useEffect, useRef, useState } from "react";
import { useSocket } from "../main/SocketHook";

// function	Message({messages}: {messages: string[]}) {
function	Message() {
	const	socket = useSocket();
	const	messagesEndRef = useRef<HTMLDivElement>(null);
	const	[messages, setMessages] = useState<string[]>([]);

	const sendMessageToChannel = (channel: string, message: string) => {
		socket?.emit("messageToChannel", { channel, message });
	}

	useEffect(() => {
		const	messageListener = (message: string) => {
			setMessages(prevMessages => [...prevMessages, message]);
		}
		socket?.on("messageToClient", messageListener);
		return () => {
			socket?.off("messageToClient", messageListener);
		}
	}, [socket]);

	useEffect(() => {
		// Yeni mesaj geldiginde yumusak bir sekilde ekrani mesaja kaydirmak icin.
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	return (
		<div id="message-page">
			Buraya mesajlar gelecek
			{messages.map((message, index) => (
				// <p key={index}>{message.login}: {message.message}</p>
				<p key={index}>{index}: {message}</p>
			))}
			<div ref={messagesEndRef} />
		</div>
	);
}

export default	Message;