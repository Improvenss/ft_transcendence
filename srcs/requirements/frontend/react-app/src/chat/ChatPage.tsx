/**
 * LINK: https://socket.io/docs/v4/server-socket-instance/
 */
import { Navigate } from "react-router-dom";
import './ChatPage.css';
import { useAuth } from "../hooks/AuthHook";
import Channel from "./Channel";
import ActiveChannel from "./ActiveChannel";
import { createContext, useContext, useEffect, useState } from "react";
import ChannelInfo from "./ChannelInfo";
import { useSocket } from "../hooks/SocketHook";
import LoadingPage from "../utils/LoadingPage";
import { IMessage, IUser } from "./iChannel";
import fetchRequest from "../utils/fetchRequest";

export interface IChannel {
	id: number,
	name: string,
	description: string,
	type: 'public' | 'private',
	status: 'involved' | 'public'//'not-involved',
	image: string,

	members: IUser[],
	admins: IUser[],
	messages: IMessage[],
	bannedUsers: IUser[],
}

interface IChannelContext {
	channels: IChannel[] | undefined;
	activeChannel: IChannel | null;
	setActiveChannel: React.Dispatch<React.SetStateAction<IChannel | null>>;
	channelInfo: boolean;
	setChannelInfo: React.Dispatch<React.SetStateAction<boolean>>;
}

export const ChannelContext = createContext<IChannelContext>({
	channels: undefined,
	activeChannel: null,
	setActiveChannel: () => {},
	channelInfo: false,
	setChannelInfo: () => {},
});

export const useChannelContext = () => {
	return useContext(ChannelContext);
};

function ChatPage () {
	console.log("---------CHAT-PAGE---------");
	const isAuth = useAuth().isAuth;
	const socket = useSocket();

	const [channels, setChannels] = useState<IChannel[] | undefined>(undefined);
	const [activeChannel, setActiveChannel] = useState<IChannel | null>(null);
	const [channelInfo, setChannelInfo] = useState(false);

	useEffect(() => {
		const fetchChannels = async () => {
			try {
				const response = await fetchRequest({
					method: 'GET',
					url: "/chat/channels",
				});
				if (!response.ok) {
					throw new Error('API-den veri alınamadı.');
				}
				const data = await response.json();
				console.log("Get Channels: ", data);
				setChannels(data);
			} catch (error) {
				console.error('Veri getirme hatası:', error);
			}
		};
	
		fetchChannels();

		const	channelListener = (channel: IChannel) => {
			console.log("Channel listesi guncelleniyor cunku degisiklik oldu.");
			fetchChannels(); // channel list update için
		}
		socket?.on("channelListener", channelListener);
		return () => {
			socket?.off("channelListener", channelListener);
		}
		/* eslint-disable react-hooks/exhaustive-deps */
	}, []);

	useEffect(() => {
		if (isAuth && channels){
			channels
			.filter((channel) => channel.status === 'involved')
			.forEach((channel) => {
				socket?.emit('joinChannel', { name: channel.name });
			});
		}
	}, [channels, socket]);

	if (!isAuth)
		return (<Navigate to='/login' replace />);

	if (channels === undefined){
		return (<LoadingPage />);
	}

	return (
		<div id="chat-page">
			<ChannelContext.Provider value={{ channels, activeChannel, setActiveChannel, channelInfo, setChannelInfo }}>
				<Channel />	
				<ActiveChannel />
				<ChannelInfo />
			</ChannelContext.Provider>
		</div>
	)
}
export default ChatPage;
