/**
 * LINK: https://socket.io/docs/v4/server-socket-instance/
 */
import React, { useEffect, useState, useRef } from "react";
import { Navigate } from "react-router-dom";
import io, { Socket } from 'socket.io-client';
import MessageInput from "./MessageInput";
import './ChatPage.css';
import Message from "./Message";
import { useSocket } from '../main/SocketHook';
import { useAuth } from '../login/AuthHook';


function ChatPage (){
	const isAuth = useAuth().isAuth;
	if (!isAuth)
		return (<Navigate to='/login' replace />);

	const	socket = useSocket();
	const	[messages, setMessages] = useState<string[]>([]);
	// const	[messages, setMessages] = useState<{login: string, message: string}[]>([]);
	console.log("ChatPage: ", socket);

	const	send = (value: string) => {
		socket?.emit("createMessage", value);
	}

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

/**
 * import React, { useEffect, useState } from "react";
import io from 'socket.io-client';

function ChatPage() {
  const [socket, setSocket] = useState(null);
  const [channel, setChannel] = useState('general');
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const socket = io.connect(process.env.REACT_APP_SOCKET_HOST);
    setSocket(socket);

    socket.on('connect', () => {
      socket.emit('joinRoom', channel);
    });

    socket.on('messageToClient', (message) => {
      setMessages((messages) => [...messages, message]);
    });

    return () => {
      socket.emit('leaveRoom', channel);
    };
  }, [channel]);

  const sendMessage = (message) => {
    socket.emit('chatToRoom', { room: channel, message });
  };

  // ... diğer kodlar ...
}

 */