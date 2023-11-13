/* ChatPage.tsx */
import React, { useEffect, useState, useRef } from "react";
import { Navigate } from "react-router-dom";
import io, { Socket } from 'socket.io-client';
import './ChatPage.css';
import MessageInput from "./MessageInput";
import './ChatPage.css';
import './Message.css';

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
	const	messagesEndRef = useRef<HTMLDivElement>(null);

	const	send = (value: string) => {
		socket?.emit("createMessage", value);
	}

	useEffect(() => {
		const newSocket = io(process.env.REACT_APP_SOCKET_HOST as string);
		setSocket(newSocket);
		newSocket.on('connect', () => {
			console.log('Client connected to Server. ✅');
		});
		newSocket.on('disconnect', () => {
			console.log('Client connection lost. 💔');
		});
	}, [setSocket]);

	const	messageListener = (message: string) => {
		setMessages(prevMessages => [...prevMessages, message]);
	}

	useEffect(() => {
		socket?.on("messageToClient", messageListener);
		return () => {
			socket?.off("messageToClient", messageListener);
		}
	}, [messageListener]);

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	return (
		<div id="chat-page">
			<div>
				{messages.map((message, index) => (
					<div key={index}>{index}: {message}</div>
				))}
				<div ref={messagesEndRef} />
			</div>
			<MessageInput send={send} />
		</div>
	)
}
export default ChatPage;


