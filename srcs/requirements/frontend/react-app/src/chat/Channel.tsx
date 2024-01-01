import { useState } from 'react';
import { ReactComponent as IconCreate } from '../assets/chat/iconCreate.svg';
import { ReactComponent as IconPublic } from '../assets/chat/iconPublic.svg';
import { ReactComponent as IconInvolved } from '../assets/chat/iconInvolved.svg';
import './Channel.css';
import ChannelCreate from './ChannelCreate';
import { useChannelContext } from './ChatPage';
import ChannelJoin from './ChannelJoin';
import fetchRequest from '../utils/fetchRequest';

function Channel() {
	console.log("---------CHAT-CHANNELS---------");
	const { channels, activeChannel, setActiveChannel } = useChannelContext();
	const [activeTab, setActiveTab] = useState('involved');
	const [searchTerm, setSearchTerm] = useState('');
	
	const handleTabClick = (tabId: string) => {
		if (activeTab !== tabId){
			setActiveTab(tabId);
		}
	};

	const handleChannelAction = async (channelName: string, action: 'login' | 'register', password?: string ) => {
		if (activeChannel?.name === channelName){
			setActiveChannel(null);
			return;
		}

		const requestBody = {
			channel: channelName,
			password: password === undefined ? null : password,
		}
		const response = await fetchRequest({
			method: (action === 'login' ? 'GET' : 'POST'),
			body: (action === 'register' ? JSON.stringify(requestBody) : undefined),
			url: (action === 'register' ? `/chat/channel/register`
				: `/chat/channel?channel=${channelName}&relations=all`),
		})
		if (!response.ok)
			throw (new Error("API fetch error."));
		const data = await response.json();
		setActiveChannel(data[0]);
		if (action === 'register')
			setActiveTab('involved');
	}

	return (
		<div id="channel">
			<div id="container">
				<div className={`tab ${activeTab === 'create' ? 'active' : ''}`} onClick={() => handleTabClick('create')}>
					<IconCreate />
				</div>
				<div className={`tab ${activeTab === 'public' ? 'active' : ''}`} onClick={() => handleTabClick('public')}>
					<IconPublic />
				</div>
				<div className={`tab ${activeTab === 'involved' ? 'active' : ''}`} onClick={() => handleTabClick('involved')}>
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
						<ChannelJoin handleChannelAction={handleChannelAction} />
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
										handleChannelAction(channel.name, (activeTab === 'public' ? 'register' : 'login'));
									}}
								>
									<img src={channel.image} alt={channel.image} />
									<span>{channel.name} {(channel.status === 'involved') ? (' | ' + channel.type) : ''}</span>
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
