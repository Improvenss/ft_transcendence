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
import { IChannel, IChannelContext } from "./iChannel";
import fetchRequest from "../utils/fetchRequest";
import { useUser } from "../hooks/UserHook";

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
	const {isAuth} = useAuth();
	const socket = useSocket();
	const { userInfo } = useUser();

	const [channels, setChannels] = useState<IChannel[] | undefined>(undefined);
	const [activeChannel, setActiveChannel] = useState<IChannel | null>(null);
	const [channelInfo, setChannelInfo] = useState(false);

	useEffect(() => {
		if (isAuth){
			const fetchChannels = async () => {
				const response = await fetchRequest({
					method: 'GET',
					url: "/chat/channels",
				});
				if (response.ok){
					const data = await response.json();
					console.log("fetchChannels:", data);
					if (!data.err){
						setChannels(data);
					} else {
						console.log("fetchChannels error:", data.err);
					}
				} else {
					console.log("---Backend Connection '❌'---");
				}
			};
			fetchChannels();
		}
	}, [isAuth]);

	useEffect(() => {
		if (isAuth && socket){
			// handleListenChannel public/private bir channel oluşturulduğunda / silindiğinde veya kicklendiğimizde update atmak için olacak.
			//Düzenlenecek!!!!
			const	handleListenChannel = ({status, action, data, newChannel}: {
				status: 'global' | 'private'
				action: string,
				data?: any,
				newChannel?: IChannel
			}) => {
				console.log(`handleListenChannel: status: [${status}] action: [${action}], data: [${data}]`);
				if (newChannel !== undefined) {
					console.log("Channel Recived:", newChannel);
					setChannels(prevChannels => {
						if (!prevChannels) return prevChannels;
						const existingChannelIndex = prevChannels.findIndex(channel => channel.name === newChannel.name) ;

						if (existingChannelIndex !== -1) {
							const updatedChannels = [...prevChannels]; // Kanal zaten var, güncelle
							updatedChannels[existingChannelIndex] = newChannel;
							return updatedChannels;
						} else {
							return [...prevChannels, newChannel]; // Kanal yok, ekleyerek güncelle
						}
					});
				}

				if (action === 'leave') {
					setChannels((prevChannels) => {
						return prevChannels?.map((channel) => {
							if (channel.name === data) {
								return channel.type === 'public' ? { ...channel, status: 'public' } : null;
							}
							return channel;
						}).filter(Boolean) as IChannel[];
					});
				}

				if (action === 'delete'){
					setChannels((prevChannels) => prevChannels?.filter((channel) => channel.name !== data));
				}
			}

			socket?.on(`globalChannelListener`, handleListenChannel); //public bir değişim söz konusu olursa bu dinleme kullanılıyor.
			// Kayıtlı olunan kanallarda değişiklik meydanda geldiğinde, kayıtlı kullanıcılarda update yapmak için
				// Private bir kanalda ve kanal silindi-adı güncellendi vs vs
			socket?.on(`userChannelListener:${userInfo?.login}`, handleListenChannel);
			return () => {
				socket?.off(`globalChannelListener`, handleListenChannel);
				socket?.off(`userChannelListener:${userInfo?.login}`, handleListenChannel);
			}
		}
		/* eslint-disable react-hooks/exhaustive-deps */
	}, [isAuth, socket]);

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
