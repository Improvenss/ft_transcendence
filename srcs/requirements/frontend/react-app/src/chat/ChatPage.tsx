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
				Kick = 'kick',
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
					case ActionType.Create: // OK ---------------------------------------------------------------------//
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
					case ActionType.Join: //OK ---------------------------------------------------------------------//
						setChannels((prevChannels) => {
							if (!prevChannels) return prevChannels;

							const updatedChannels = prevChannels.map((channel) => {
								if (channel.id === channelId) {
									const updatedMembers = [...channel.members, data];;
									return { ...channel, members: updatedMembers };
								} else {
									return channel;
								}
							});
							return updatedChannels;
						});
						break;
					case ActionType.Delete: //OK ---------------------------------------------------------------------//
						setChannels((prevChannels) => prevChannels?.filter((channel) => channel.id !== channelId));
						if (activeChannel?.id === channelId) {
							setActiveChannel(null);
						}
						break;
					case ActionType.Leave://OK ---------------------------------------------------------------------//
						if (data.userId === userInfo.id){ //--> 2. durum çıkan kişiyi güncelle
							console.log("------->", "Leave", data.userId);
								if (data.type === 'private'){
									setChannels((prevChannels) => prevChannels?.filter((channel) => channel.id !== channelId));
								} else {
									setChannels((prevChannels) => {
										if (prevChannels) {
											return prevChannels.map((channel) => {
												if (channel.id === activeChannel?.id) {
													return {
														...channel,
														members: [],
														admins: [],
													messages: [],
													bannedUsers: [],
													status: 'public',
												};
											}
											return channel;
										});
									}
									return prevChannels;
								});
							}
							if (activeChannel?.id === channelId)
								setActiveChannel(null);
						} else { //--> 1. durum başka biri çıkıyor, membersi güncelle
							setChannels((prevChannels) => {
								if (!prevChannels) return prevChannels;
							  
								const updatedChannels = prevChannels.map((channel) => {
									if (channel.id === channelId) {
										const updatedMembers = channel.members.filter((user) => user.id !== data.userId);
										return { ...channel, members: updatedMembers };
									} else {
										return channel;
									}
								});
							  
								return updatedChannels;
							});
						}
						break;
					case ActionType.NewMessage: //OK ---------------------------------------------------------------------//
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
					case ActionType.Update: //OK ---------------------------------------------------------------------//
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
					case ActionType.RemoveAdmin: //OK ---------------------------------------------------------------------//
						setChannels((prevChannels) => {
							if (!prevChannels) return prevChannels;
						  
							const updatedChannels = prevChannels.map((channel) => {
								if (channel.id === channelId) {
									const updatedAdmins = channel.admins.filter((admin) => admin.id !== data.id);
									return { ...channel, admins: updatedAdmins };
								} else {
									return channel;
								}
							});
						  
							return updatedChannels;
						  });
						break;
					case ActionType.Kick: //OK ---------------------------------------------------------------------//
						setChannels((prevChannels) => { //diğer kullanıcılar için
							if (!prevChannels) return prevChannels;
							const updatedChannels = prevChannels.map((channel) => {
								if (channel.id === channelId) {
									const updatedUsers = channel.members.filter((user) => user.id !== data.id);
									return { ...channel, members: updatedUsers };
								} else {
									return channel;
								}
							});
							return updatedChannels;
						});
						break;
					case ActionType.SetAdmin: //OK ---------------------------------------------------------------------//
						setChannels((prevChannels) => {
							if (!prevChannels) return prevChannels;

							const updatedChannels = prevChannels.map((channel) => {
								if (channel.id === channelId) {
									const updatedAdmins = [...channel.admins, data];;
									return { ...channel, admins: updatedAdmins };
								} else {
									return channel;
								}
							});
							return updatedChannels;
						});
						break;
					case ActionType.Ban: //OK ---------------------------------------------------------------------//
						setChannels((prevChannels) => {
							if (!prevChannels) return prevChannels;

							const updatedChannels = prevChannels.map((channel) => {
								if (channel.id === channelId) {
									const updateMembers = channel.members.filter((user) => user.id !== data.id);
									const updatedbannedUsers = [...channel.bannedUsers, data];;
									return { ...channel, bannedUsers: updatedbannedUsers, members: updateMembers };
								} else {
									return channel;
								}
							});
							return updatedChannels;
						});
						break;
					case ActionType.UnBan: //OK ---------------------------------------------------------------------//
						setChannels((prevChannels) => {
							if (!prevChannels) return prevChannels;
						
							const updatedChannels = prevChannels.map((channel) => {
								if (channel.id === channelId) {
									const updatedbannedUsers = channel.bannedUsers.filter((member) => member.id !== data.id);
									return { ...channel, bannedUsers: updatedbannedUsers };
								} else {
									return channel;
								}
							});
						
							return updatedChannels;
						});
						break;
				}
			}

			socket.on('channelListener', handleListenChannel);
			return () => {
				socket.off(`channelListener`, handleListenChannel);
			}
		}
		/* eslint-disable react-hooks/exhaustive-deps */
	}, [isAuth, socket, activeChannel]);

	useEffect(() => {
		if (activeChannel && channels) {
			const updatedActiveChannel = channels.find((channel) => channel.id === activeChannel.id);
			if (updatedActiveChannel) {
				setActiveChannel(updatedActiveChannel);
			}
		}
	}, [channels]);


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


