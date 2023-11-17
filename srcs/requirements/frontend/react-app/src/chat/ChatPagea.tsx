import { useEffect, useState } from "react";
import io, { Socket } from 'socket.io-client';

function ChatPage() {
	const	[socket, setSocket] = useState<Socket>();
	const	[messages, setMessages] = useState<string[]>([]);
	const	[value, setValue] = useState("");

	const	send = (message: string) => {
		socket?.emit("message", message);
	}

	const	messageListener = (message: string) => {
		setMessages((prevMessages) => [...prevMessages, message]);
	}

	useEffect(() => {
		const	newSocket = io(process.env.REACT_APP_SOCKET_HOST as string);
		setSocket(newSocket);
	}, [setSocket]);

	useEffect(() => {
		socket?.on("message", messageListener);
		return (() => {
			socket?.off("message", messageListener);
		});
	}, [socket]);

	console.log("cetim kac kere caliti?");
	return (
		<div>
			Mesajlar bekleniore. Gonder.
			<input
				onChange={(e) => setValue(e.target.value)}
				placeholder="Type your message... "
				value={value}></input>
			<button onClick={() => send(value)}>GONDER MESAJI BENI SENI</button>
			{messages.map((message, index) => (
				<p key={index}>{index}: {message}</p>
			))}
		</div>
	);
}

export default ChatPage;