import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import io, { Socket } from 'socket.io-client';
import Message from "./Message";
import MessageInput from "./MessageInput";

interface ChatPageProps {
	isAuth: boolean;
}

function ChatPage ({isAuth}: ChatPageProps){
	if (!isAuth)
	{
		return (
			<Navigate to='/login' replace />
		);
	}

	const	[socket, setSocket] = useState<Socket>();
	const	[messages, setMessages] = useState<string[]>([]);
		console.log(process.env.REACT_APP_SOCKET_HOST, "asdfasdf");

	const	send = (value: string) => {
		socket?.emit("message", value);
	}

	useEffect(() => {
		const	newSocket = io(process.env.REACT_APP_SOCKET_HOST as string);
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
		<div id="chat-page">
			<MessageInput send={send} />
			<Message messages={messages} />
		</div>
	)
}
export default ChatPage;