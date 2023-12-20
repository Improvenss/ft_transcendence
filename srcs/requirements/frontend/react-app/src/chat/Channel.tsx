import { useEffect, useRef, useState } from 'react';
import { ReactComponent as IconCreate } from '../assets/chat/iconCreate.svg';
import { ReactComponent as IconPublic } from '../assets/chat/iconPublic.svg';
import { ReactComponent as IconInvolved } from '../assets/chat/iconInvolved.svg';
import './Channel.css';
import { IChannel, IMessage } from './iChannel';
import { useSocket } from '../hooks/SocketHook';
import ChannelCreate from './ChannelCreate';
import { useChannelContext } from './ChatPage';
import ChannelJoin from './ChannelJoin';
import Cookies from 'js-cookie';

// function Channel({ setSelectedChannel, channels }: IChannelProps) {
function Channel() {
	console.log("---------CHAT-CHANNELS---------");
	const { channels, activeChannel, setActiveChannel } = useChannelContext();
	const [activeTab, setActiveTab] = useState('involved');
	const [searchTerm, setSearchTerm] = useState('');
	const socket = useSocket();
	const userCookie = Cookies.get("user");
	
	const handleTabClick = (tabId: string) => {
		if (activeTab !== tabId){
			setActiveTab(tabId);
			// Implement logic to update content based on the selected tab
			// For now, let's just log a message to the console
			console.log(`Switched to ${tabId} tab`);
		}
	};

	const handleRegisterChannel = async (channel: string, password: string | null) => {
		try
		{
			const response = await fetch(process.env.REACT_APP_FETCH + `/chat/channel/register`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					"Authorization": "Bearer " + userCookie,
				},
				body: JSON.stringify({
					channel: channel,
					password: password,
				}),
			});
			if (!response.ok)
				throw (new Error("API fetch error."));
			const data = await response.json();
			setActiveChannel(data[0]);
			setActiveTab('involved');
			//if (!data.response)
				//throw (new Error("user can't registered!"));
		}
		catch (err)
		{
			console.error("ERROR: Channel.tsx: handleRegisterChannel():", err);
		}
	}

	const handleChannelClick = async (channel: IChannel) => {
		try
		{
			if (activeChannel?.name !== channel.name){
				const response = await fetch(process.env.REACT_APP_FETCH + `/chat/channel?channel=${channel.name}&relations=all`, {
					method: 'GET', // ya da 'POST', 'PUT', 'DELETE' gibi isteğinize uygun HTTP metodunu seçin
					headers: {
						'Content-Type': 'application/json',
						"Authorization": "Bearer " + userCookie,
					},
				});
				if (!response.ok)
					throw (new Error("API fetch error."));
				const data = await response.json();
				setActiveChannel(data[0]);
				console.log(`Switched to ${channel.name} channel.`);
			}
			else {
				setActiveChannel(null); //Aynı kanalın üstüne tıklayınca activeChannel kapanıyor.
			}
		}
		catch (err)
		{
			console.error("ERROR: handleChannelClick():", err);
			setActiveChannel(null); //Aynı kanalın üstüne tıklayınca activeChannel kapanıyor.  }
		};
	}

	return (
		<div id="channel">
			<div id="container">
				<div className={`channel ${activeTab === 'create' ? 'active' : ''} tab`} onClick={() => handleTabClick('create')}>
					<IconCreate />
				</div>
				<div className={`channel ${activeTab === 'public' ? 'active' : ''} tab`} onClick={() => handleTabClick('public')}>
					<IconPublic />
				</div>
				<div className={`channel ${activeTab === 'involved' ? 'active' : ''} tab`} onClick={() => handleTabClick('involved')}>
					<IconInvolved />
				</div>
			</div>
			<div id="container-content">
					<div className="content-header">
						{activeTab === 'create' && <h1>Create a Channel</h1>}
						{activeTab === 'public' && <h1>Public Channels</h1>}
						{activeTab === 'involved' && <h1>Involved Rooms</h1>}
						{activeTab === 'join' && <h1>Join Channel</h1>}
					</div>
					{activeTab === 'create' && (
						<ChannelCreate onSuccess={handleTabClick}/>
					)}
					{activeTab === 'join' && (
						<ChannelJoin onSuccess={handleTabClick} handleRegisterChannel={handleRegisterChannel} />
					)}
					{(activeTab === 'public' || activeTab === 'involved') && (
						<div>
						<input
							id="channel-search"
							type="text"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							placeholder="Search channels..."
						/>
						{channels && channels
							.filter((channel) => channel.status === activeTab && channel.name.toLowerCase().includes(searchTerm.toLowerCase()))
							.map((channel) => (
								<div
									key={channel.name}
									className={activeChannel && activeChannel.name === channel.name ? 'active' : 'inactive'}
									id={activeTab === 'public' ? 'public-channel' : 'involved-channel'}
									onClick={() => {
										if (activeTab === 'public'){
											handleRegisterChannel(channel.name, null);
										}
										else
											handleChannelClick(channel)
									
									}} // Tıklama olayı
								>
									<img src={channel.image} alt={channel.image} />
									<span>{channel.name}</span>
								</div>
						))}
						{activeTab === 'involved' &&
 							<button id="joinChannel" onClick={() => handleTabClick('join')}> Join Channel </button>
						}
						</div>
					)}
				</div>
		</div>
	);
}

export default Channel;
