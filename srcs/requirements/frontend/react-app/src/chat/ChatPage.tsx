/**
 * LINK: https://socket.io/docs/v4/server-socket-instance/
 */
import { Navigate, useNavigationType } from "react-router-dom";
import './ChatPage.css';
import { useAuth } from "../hooks/AuthHook";
import Channel from "./Channel";
// import OnChannel from "./OnChannel";
import { useEffect, useState } from "react";
import { CreateChannelDto, IChannel, IChannelProps } from './iChannel';
// import InfoChannel from "./InfoChannel";
import Cookies from "js-cookie";
import { useSocket } from "../hooks/SocketHook";
import LoadingPage from "../utils/LoadingPage";

const mapBackendToFrontend = (backendData: CreateChannelDto[]): IChannel[] => {
	return backendData.map(item => ({
	  status: item.status as 'public' | 'involved', // Eğer backend'de "status" varsa, uyarlama yapmalısınız
	  name: item.name,
	  type: item.type as 'public' | 'involved',
	  password: item.password || '', // Eğer backend'de "password" varsa, uyarlama yapmalısınız
	  image: item.image,
	}));
  };

function ChatPage () {
	console.log("---------CHAT-PAGE---------");
	const isAuth = useAuth().isAuth;
	const socket = useSocket();
	const userCookie = Cookies.get("user");
	const navigationType = useNavigationType();
	const status = localStorage.getItem('userLoginPage');

	useEffect(() => {
		window.onbeforeunload = () => localStorage.removeItem('userLoginPage');
		return () => {
			window.onbeforeunload = null;
		};
	}, []);
	// const [selectedChannel, setSelectedChannel] = useState<IChannel | null>(() => {
	// 	const globalChannel = channels.find(channel => channel.status === 'involved' && channel.name === 'Global Channel');
	// 	if (globalChannel === undefined)
	// 		return (null);
	// 		// {status: 'involved', name: 'Global Channel', type: 'involved', image: 'img3' };
	// 	return (globalChannel);
	// });

	// const [isInfoChannelActive, setIsInfoChannelActive] = useState(false);

	const [channels, setChannels] = useState<IChannel[] | undefined>(undefined);

	useEffect(() => {
		const fetchChannels = async () => {
		  try {
			const responseAllChannels = await fetch(process.env.REACT_APP_FETCH + "/chat/channel?relations=all", {
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
			const frontendChannels = mapBackendToFrontend(data);
			setChannels(frontendChannels);
		  } catch (error) {
			console.error('Veri getirme hatası:', error);
		  }
		};
	
		fetchChannels();

		const	channelListener = (channel: IChannel) => {
			fetchChannels();
		}
		socket?.on("channelListener", channelListener);
		return () => {
			socket?.off("channelListener", channelListener);
		}

	}, []);

	if (!isAuth)
		return (<Navigate to='/login' replace />);

	if (channels === undefined){
		return (<LoadingPage />);
	}

	return (
		<div id="chat-page">
			<Channel channels={channels} />	
			{/* <Channel setSelectedChannel={setSelectedChannel} channels={channels} /> */}
			{/* <OnChannel selectedChannel={selectedChannel} isInfoChannelActive={isInfoChannelActive} setIsInfoChannelActive={setIsInfoChannelActive}/> */}
			{/* <InfoChannel selectedChannel={selectedChannel} isInfoChannelActive={isInfoChannelActive} setIsInfoChannelActive={setIsInfoChannelActive}/> */}
			{/* <Channels /> */}
			{/* <Message /> */}
			{/* <MessageInput /> */}
			{/* <Users /> */}
		</div>
	)
}
export default ChatPage;