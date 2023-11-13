/**
 * LINK: https://socket.io/docs/v4/server-socket-instance/
 */
import React, { useEffect, useState, useRef } from "react";
import { Navigate } from "react-router-dom";
import io, { Socket } from 'socket.io-client';
import MessageInput from "./MessageInput";
import './ChatPage.css';
import Message from "./Message";

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
	// const	[messages, setMessages] = useState<{login: string, message: string}[]>([]);

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

	// const	messageListener = (message: {login: string, message: string}) => {
	const	messageListener = (message: string) => {
		setMessages(prevMessages => [...prevMessages, message]);
	}

	useEffect(() => {
		socket?.on("messageToClient", messageListener);
		return () => {
			socket?.off("messageToClient", messageListener);
		}
	}, [messageListener]);

	return (
		<div id="chat-page">
			<Message messages={messages}/>
			<MessageInput send={send} />
		</div>
	)
}
export default ChatPage;
