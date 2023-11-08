import React, { useEffect, useState } from "react";
import io, { Socket } from 'socket.io-client';
import Message from "./Message";
import MessageInput from "./MessageInput";

function	SocketClient() {
	const	[socket, setSocket] = useState<Socket>();
	const	[messages, setMessages] = useState<string[]>([]);
		console.log(process.env.SOCKET_HOST, "asdfasdf");

	const	send = (value: string) => {
		socket?.emit("message", value);
	}

	useEffect(() => {
		const	newSocket = io(process.env.SOCKET_HOST as string);
		setSocket(newSocket);
	}, [setSocket]);

	const	messageListener = (message: string) => {
		setMessages([...messages, message]);
	}

	useEffect(() => {
		socket?.on("message", messageListener);
		return () => {
			socket?.off("message", messageListener);
		}
	}, [messageListener]);

	return (
		<div>
			<MessageInput send={send} />
			<Message messages={messages} />
		</div>
	)
}
export default SocketClient;