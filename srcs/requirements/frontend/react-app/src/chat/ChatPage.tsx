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
// import InfoChannel from "./InfoChannel";
import Cookies from "js-cookie";
import { useSocket } from "../hooks/SocketHook";
import LoadingPage from "../utils/LoadingPage";

// const mapBackendToFrontend = (backendData: CreateChannelDto[]): IChannel[] => {
// 	return backendData.map(item => ({
// 	  status: item.status as 'public' | 'involved', // Eğer backend'de "status" varsa, uyarlama yapmalısınız
// 	  name: item.name,
// 	  type: item.type as 'public' | 'involved',
// 	  password: item.password || '', // Eğer backend'de "password" varsa, uyarlama yapmalısınız
// 	  image: item.image,
// 	}));
//   };

export const ChannelContext = createContext<IChannelContext>({
	channels: undefined,
	activeChannel: null,
	setActiveChannel: () => {},
});

export const useChannelContext = () => {
	return useContext(ChannelContext);
};

function ChatPage () {
	console.log("---------CHAT-PAGE---------");
	const isAuth = useAuth().isAuth;
	const socket = useSocket();
	const userCookie = Cookies.get("user");
	// const status = localStorage.getItem('userLoginPage');

	// useEffect(() => {
	// 	window.onbeforeunload = () => localStorage.removeItem('userLoginPage');
	// 	return () => {
	// 		window.onbeforeunload = null;
	// 	};
	// }, []);


	// const [isInfoChannelActive, setIsInfoChannelActive] = useState(false);
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
			//  const responseAllChannels = await fetch(process.env.REACT_APP_FETCH + "/chat/channels?channel=abc&relations=all", {
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
			// console.log("--->", data);
			// const frontendChannels = mapBackendToFrontend(data); ///buna gerek olmayabilir, sonra kontrol et.
			// console.log("--->", frontendChannels);
			// setChannels(frontendChannels);
			setChannels(data);
		  } catch (error) {
			console.error('Veri getirme hatası:', error);
		  }
		};
	
		fetchChannels();

		const	channelListener = (channel: IChannel) => {
			console.log("socket listen");
			fetchChannels(); // channel list update için
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
			<ChannelContext.Provider value={{ channels, activeChannel, setActiveChannel }}>
				<Channel />	
				{/* <Channel channelsData={channels} />	 */}
				{/* <Channel setActiveChannel={setActiveChannel} channels={channels} /> */}

				<ActiveChannel />
				{/* <ActiveChannel channelsData={activeChannel}/> */}
				{/* <InfoChannel activeChannel={activeChannel} isInfoChannelActive={isInfoChannelActive} setIsInfoChannelActive={setIsInfoChannelActive}/> */}
				{/* <Channels /> */}
				{/* <Message /> */}
				{/* <MessageInput /> */}
				{/* <Users /> */}
			</ChannelContext.Provider>
		</div>
	)
}
export default ChatPage;
