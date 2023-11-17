/**
 * LINK: https://socket.io/docs/v4/server-socket-instance/
 */
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import MessageInput from "./MessageInput";
import './ChatPage.css';
import Message from "./Message";
import { useSocket } from '../main/SocketHook';
import { useAuth } from '../login/AuthHook';


function ChatPage (){
	console.log("---------CHAT-PAGE---------");
	const isAuth = useAuth().isAuth;
	const	socket = useSocket();
	const	[messages, setMessages] = useState<string[]>([]);
	console.log("ChatPage: ", socket);

	const	send = (value: string) => {
		socket?.emit("createMessage", value);
	}

	const	messageListener = (message: string) => {
		setMessages(prevMessages => [...prevMessages, message]);
	}

	useEffect(() => {
		socket?.on("messageToClient", messageListener);
		return () => {
			socket?.off("messageToClient", messageListener);
		}
	}, [messageListener]);

	if (!isAuth)
		return (<Navigate to='/login' replace />);

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