// import React from "react";
// import Message from "./Message";
// import MessageInput from "./MessageInput";
// import { Navigate } from "react-router-dom";
// import io from 'socket.io-client';

// interface ChatPageProps {
// 	isAuth: boolean;
// }

// function ChatPage ({isAuth}: ChatPageProps){
// 	if (!isAuth)
// 	{
// 		return (
// 			<Navigate to='/login' replace />
// 		);
// 	}

// 	const socket = io('https://10.12.14.8:3000/chat');

// 	socket.on('connect', () => {
// 		console.log('connected');
// 	});

// 	socket.on('messageToClient', (msg) => {
// 		console.log('Message received: ', msg);
// 	});


// 	return (
// 		<div>
// 			kaka
// 			{/* <MessageInput />
// 			<Message /> */}
// 		</div>
// 	);
// };

// export default ChatPage;








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


	const	send = (value: string) => {
		socket?.emit("createMessage", value);
		console.log("kac kere girdik abi");
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
		setMessages([...messages, message]);
	}

	useEffect(() => {
		socket?.on("messageToClient", messageListener);
		return () => {
			socket?.off("messageToClient", messageListener);
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