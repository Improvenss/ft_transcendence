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
	setChannels: () => {},
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
		if (isAuth && socket && userInfo){

			enum ActionType {
				Create = 'create',
				Delete = 'delete',
				NewMessage = 'newMessage',
				Join = 'join',
				Leave = 'leave',
				Kick = 'updateUser',
				Ban = 'ban',
				UnBan = 'unban',
				SetAdmin = 'setAdmin',
				RemoveAdmin = 'removeAdmin',
				Update = 'update',
			}

			const	handleListenChannel = ({action, channelId, data}: {
				action: ActionType,
				channelId: number,
				data?: any
			}) => {
				console.log(`handleListenChannel: action[${action}] channelId[${channelId}]`);
				switch (action) {
					case ActionType.Create:
						console.log("Channel Recived:", data);
						setChannels(prevChannels => {
							if (!prevChannels) return prevChannels;
							const existingChannelIndex = prevChannels.findIndex(channel => channel.id === channelId) ;
	
							if (existingChannelIndex !== -1) {
								const updatedChannels = [...prevChannels]; // Kanal zaten var, güncelle
								updatedChannels[existingChannelIndex] = data;
								return updatedChannels;
							} else {
								return [...prevChannels, data]; // Kanal yok, ekleyerek güncelle
							}
						});
						break;
					case ActionType.Delete:
						setChannels((prevChannels) => prevChannels?.filter((channel) => channel.id !== channelId));
						break;
					case ActionType.Leave:
						break;
					case ActionType.NewMessage:
						setChannels((prevChannels) => {
							if (!prevChannels) return prevChannels;

							const updatedChannels = prevChannels.map((channel) => {
							if (channel.id === channelId) {
								const updatedMessages = [...channel.messages, data];;
								return { ...channel, messages: updatedMessages };
							} else {
								return channel;
							}
							});
							return updatedChannels;
						});
						break;
					case ActionType.Update:
						setChannels((prevChannels) => {
							if (!prevChannels) return prevChannels;

							const updatedChannels = prevChannels.map((channel) => {
							if (channel.id === channelId) {
								const updatedChannel = {
									...channel,
									...data
								};
								return (updatedChannel);
							} else {
								return channel;
							}
							});
						
							return updatedChannels;
						});
						break;
					case ActionType.RemoveAdmin:
						// setChannels((prevChannels) => {
						// 	if (!prevChannels) return prevChannels;

						// 	const updatedChannels = prevChannels.map((channel) => {
						// 	if (channel.id === channelId) {

						// 		return (updatedChannel);
						// 	} else {
						// 		return channel;
						// 	}
						// 	});
						
						// 	return updatedChannels;
						// });
						break;
				}
			}

			socket.on('channelListener', handleListenChannel);
			return () => {
				socket.off(`channelListener`, handleListenChannel);
			}
		}
		/* eslint-disable react-hooks/exhaustive-deps */
	}, [isAuth, socket]);

	useEffect(() => {
		if (activeChannel && channels) {
			const updatedActiveChannel = channels.find((channel) => channel.id === activeChannel.id);
			if (updatedActiveChannel) {
				setActiveChannel(updatedActiveChannel);
			}
		}
	}, [channels]); /// activeChannel yerine doğrudan channels'dan çekilebilir verileri. bu sayede tekrardan derleme olayı ortadan kalkabilir
	  

	if (!isAuth)
		return (<Navigate to='/login' replace />);

	if (channels === undefined){
		return (<LoadingPage />);
	}

	return (
		<div id="chat-page">
			<ChannelContext.Provider value={{ channels, setChannels, activeChannel, setActiveChannel, channelInfo, setChannelInfo }}>
				<Channel />	
				{userInfo && (
					<ActiveChannel userId={userInfo.id}/>
				)}
				<ChannelInfo />
			</ChannelContext.Provider>
		</div>
	)
}

export default ChatPage;