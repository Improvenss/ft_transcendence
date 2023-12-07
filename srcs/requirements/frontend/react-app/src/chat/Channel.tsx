import { useRef, useState } from 'react';
import { ReactComponent as IconCreate } from '../assets/chat/iconCreate.svg';
import { ReactComponent as IconPublic } from '../assets/chat/iconPublic.svg';
import { ReactComponent as IconInvolved } from '../assets/chat/iconInvolved.svg';
import './Channel.css';
import { IChannelProps, IChannel, IMessage } from './iChannel';
import { useSocket } from '../hooks/SocketHook';
import ChannelCreate from './ChannelCreate';

// function Channel({ setSelectedChannel, channels }: IChannelProps) {
	function Channel({ channels }: IChannelProps) {
	const [activeTab, setActiveTab] = useState('involved');
	// const [showPassword, setShowPassword] = useState(false);
	// const CreateChannelForm = useRef<HTMLFormElement>(null);
	// const [selectedImage, setSelectedImage] = useState<string | null>(null);
	const [searchTerm, setSearchTerm] = useState('');
	const socket = useSocket();

	const handleTabClick = (tabId: string) => {
		// if (tabId !== 'create') {
		// 	setShowPassword(false);
		// }
		setActiveTab(tabId);
		// Implement logic to update content based on the selected tab
		// For now, let's just log a message to the console
		console.log(`Switched to ${tabId} channel`);
	};

	const handleChannelClick = (channel: IChannel) => {
			// setSelectedChannel(channel);
	};

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
					</div>
					{activeTab === 'create' && (
						<ChannelCreate />
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
						{channels
							.filter((channel) => channel.status === activeTab && channel.name.toLowerCase().includes(searchTerm.toLowerCase()))
							.map((channel) => (
								<div
									key={channel.name}
									id={activeTab === 'public' ? 'public-channel' : 'involved-channel'}
									onClick={() => {
										if (activeTab === 'public'){

										}
										else
											handleChannelClick(channel)
									
									}} // Tıklama olayı
								>
									<img src={channel.image} alt={channel.image} />
									<span>{channel.name}</span>
								</div>
						))}
						</div>
					)}
				</div>
		</div>
	);
}

export default Channel;
