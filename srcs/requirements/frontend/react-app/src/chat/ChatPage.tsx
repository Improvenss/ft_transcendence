/**
 * LINK: https://socket.io/docs/v4/server-socket-instance/
 */
import { Navigate } from "react-router-dom";
import './ChatPage.css';
import { useAuth } from "../hooks/AuthHook";
import Channel from "./Channel";
import ActiveChannel from "./ActiveChannel";
import { createContext, useContext, useEffect, useState } from "react";
import { IChannel, IChannelContext } from './iChannel';
import ChannelInfo from "./ChannelInfo";
import Cookies from "js-cookie";
import { useSocket } from "../hooks/SocketHook";
import LoadingPage from "../utils/LoadingPage";

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
	const userCookie = Cookies.get("user");

	const [channelInfo, setChannelInfo] = useState(false);
	const [channels, setChannels] = useState<IChannel[] | undefined>(undefined);
	const [activeChannel, setActiveChannel] = useState<IChannel | null>(() => {
		const globalChannel = channels?.find(channel => channel.status === 'involved' && channel.name === 'Global Channel');
		if (globalChannel === undefined) //Henüz global channel olmadığı için null dönüyor, ama boş channel oluşturup seçilirse pencere açılır.
			return (null);
		return (globalChannel);
	});

	useEffect(() => {
		const fetchChannels = async () => {
		  try {
			//  const responseAllChannels = await fetch(process.env.REACT_APP_FETCH + "/chat/channel?channel=abc&relations=all", {
				const responseAllChannels = await fetch(process.env.REACT_APP_FETCH + "/chat/channel?relations=members", {
					method: 'GET', // ya da 'POST', 'PUT', 'DELETE' gibi isteğinize uygun HTTP metodunu seçin
					headers: {
						'Content-Type': 'application/json',
						"Authorization": "Bearer " + userCookie,
					},
				});
	
				if (!responseAllChannels.ok) {
					throw new Error('API-den veri alınamadı.');
				}
				const data = await responseAllChannels.json();
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
