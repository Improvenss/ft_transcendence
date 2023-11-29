/**
 * LINK: https://socket.io/docs/v4/server-socket-instance/
 */
import { Navigate } from "react-router-dom";
import './ChatPage.css';
import Channels from "./Channels";
import Message from "./Message";
import MessageInput from "./MessageInput";
import { useAuth } from "../hooks/AuthHook";
import Users from "./Users";
import Channel from "./Channel";
import OnChannel from "./OnChannel";
import { useState } from "react";
import { IChannel } from './iChannel';
import InfoChannel from "./InfoChannel";
// import { useEffect } from "react";
// import { useSocket } from "../main/SocketHook";

function ChatPage () {
	console.log("---------CHAT-PAGE---------");
	const isAuth = useAuth().isAuth;
	
	const [channels, setChannels] = useState<IChannel[]>(() => {
		// Kanal listesini burada güncelleyin (örneğin, bir API'den kanal verilerini alabilirsiniz)
		const fetchedChannels: IChannel[] = [
			{ status: 'involved', name: 'Global Channel', type: 'involved', image: '/global.png',
				users: [{name: 'akaraca', image: '/userImg.png'}, {name: 'damnn', image: '/userImg2.png'}],
				chat: [
					{sender: 'akaraca', content: 'Hello!', timestamp: Date.now()},
					{sender: 'damnn', content: 'Hi there!', timestamp: Date.now() + 10000},
					{sender: 'uercan', content: 'Hi bitches!', timestamp: Date.now() + 15000},
					{sender: 'uercan', content: 'I am come back!', timestamp: Date.now() + 16000},
					{sender: 'gsever', content: 'it is a dog? Thats look weird!', timestamp: Date.now() + 21000},
					{sender: 'akaraca', content: 'u r too!', timestamp: Date.now() + 25000}
				]
			},
	
			// Diğer kanallar...
			]; // Örnek kanal listesi
			return (fetchedChannels)
	});

	const [selectedChannel, setSelectedChannel] = useState<IChannel | null>(() => {
		const globalChannel = channels.find(channel => channel.status === 'involved' && channel.name === 'Global Channel');
		if (globalChannel === undefined)
			return (null);
			// {status: 'involved', name: 'Global Channel', type: 'involved', image: 'img3' };
		return (globalChannel);
	});

	if (!isAuth)
		return (<Navigate to='/login' replace />);

	return (
		<div id="chat-page">
			<Channel setSelectedChannel={setSelectedChannel} channels={channels} />
			<OnChannel selectedChannel={selectedChannel} />
			<InfoChannel selectedChannel={selectedChannel} />
			{/* <Channels /> */}
			{/* <Message /> */}
			{/* <MessageInput /> */}
			{/* <Users /> */}
		</div>
	)
}
export default ChatPage;