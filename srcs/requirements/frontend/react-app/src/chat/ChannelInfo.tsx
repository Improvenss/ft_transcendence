import { useRef, useState } from "react";
import { IFriend } from "./iChannel";
import { ReactComponent as IconUsers } from '../assets/chat/iconUsers.svg';
import { ReactComponent as IconSettings } from '../assets/chat/iconSettings.svg';
import { ReactComponent as IconAddUser } from '../assets/chat/iconAddUser.svg';
import './ChannelInfo.css';
import { useChannelContext } from "./ChatPage";
import Cookies from "js-cookie";

 function InfoChannel() {
	// { selectedChannel, isInfoChannelActive, setIsInfoChannelActive }: IOnChannelProps
	const { activeChannel, setActiveChannel, channelInfo, setChannelInfo } = useChannelContext();
	const userCookie = Cookies.get("user");
 	const [activeTabInfo, setActiveTabInfo] = useState('infoUsers');
 	const [userSearchTerm, setUserSearchTerm] = useState('');
 	const inputRefUpdateChannelName = useRef<HTMLInputElement>(null);
 	const [friendSearchTerm, setFriendSearchTerm] = useState('');
 	const [friendList, setFriendList] = useState<IFriend[]>( () => {
 		const fetchFriendList: IFriend[] = [
 			{ name: 'uercan', status: 'offline', image: '/dogSlayer.png' },
 			{ name: 'gsever', status: 'online', image: '/heart.jpg' },
 			{ name: 'Admin', status: 'AFK', image: '/watcher.jpg' }
 		];
 		return (fetchFriendList);
 	});

 	//const handleAdditionalMenuClick = () => {
 	//	// Toggle the state to activate/deactivate infoChannel
 	//	setChannelInfo(!channelInfo);
 	//};

	const	handleChannelLeave = async (selectedChannel: string) => {
		console.log(`User leave ${selectedChannel} channel`);
		const responseChannelDelete = await fetch(process.env.REACT_APP_FETCH + `/chat/channel/leave?channel=${selectedChannel}`, {
			method: 'GET', // ya da 'POST', 'PUT', 'DELETE' gibi isteğinize uygun HTTP metodunu seçin
			headers: {
				'Content-Type': 'application/json',
				"Authorization": "Bearer " + userCookie,
			},
		});
		if (!responseChannelDelete.ok) {
			throw new Error('API-den veri alınamadı.');
		}
		const data = await responseChannelDelete.json();
		console.log("Leave Channel:", data);
		setActiveChannel(null);
	}

	const	handleChannelDelete = async (selectedChannel: string) => {
		const responseChannelDelete = await fetch(process.env.REACT_APP_FETCH + `/chat/channel?channel=${selectedChannel}`, {
			method: 'DELETE', // ya da 'POST', 'PUT', 'DELETE' gibi isteğinize uygun HTTP metodunu seçin
			headers: {
				'Content-Type': 'application/json',
				"Authorization": "Bearer " + userCookie,
			},
		});
		if (!responseChannelDelete.ok) {
			throw new Error('API-den veri alınamadı.');
		}
		const data = await responseChannelDelete.json();
		console.log("DELETE Channel:", data);
		setActiveChannel(null);
	}

 	const handleTabInfoClick = (tabId: string) => {
 		setActiveTabInfo(tabId);
 		// Implement logic to update content based on the selected tab
 		// For now, let's just log a message to the console
 		console.log(`Switched to channel ${tabId}`);
 	};

 	const handleUpdateChannelName = () => {
 		if (inputRefUpdateChannelName.current) {
 			const editedChannelName = inputRefUpdateChannelName.current.value;
 			if (inputRefUpdateChannelName.current.value.length > 0){
 				console.log('Channel name updated:', editedChannelName);
 				inputRefUpdateChannelName.current.value = '';
 			}
 		  }
 	};

 	return (
 		<>
 			{activeChannel && (
 				<div id="infoChannel" style={{ visibility: channelInfo ? 'visible' : 'hidden', display: channelInfo ? 'flex' : 'none' }}>
 					<div id="channelInfoContainer">
 						<div className={`channel ${activeTabInfo === 'infoUsers' ? 'active' : ''} tab-info-channel`} onClick={() => handleTabInfoClick('infoUsers')}>
 							<IconUsers />
 						</div>
 						<div className={`channel ${activeTabInfo === 'infoChannel' ? 'active' : ''} tab-info-channel`} onClick={() => handleTabInfoClick('infoChannel')}>
 							<IconSettings />
 						</div>
 					</div>
 					<div id="info-content-container">
 						<div className="info-content-header">
 							{activeTabInfo === 'infoUsers' && <h1>Channel Users</h1>}
 							{activeTabInfo === 'infoChannel' && <h1>Channel Settings</h1>}
 							{activeTabInfo === 'infoFriends' && <h1>Invite Friends</h1>}
 						</div>

 						{ activeTabInfo === 'infoUsers' && (
 							<div>
 								<input
 									id="userSearch"
 									type="text"
 									value={userSearchTerm}
 									onChange={(e) => setUserSearchTerm(e.target.value)}
 									placeholder="Search users..."
 								/>
 								{activeChannel.members
 									.filter((user) => user.login.toLowerCase().includes(userSearchTerm.toLowerCase()))
 									.map((user, index) => (
 									<div
 										key={index}
 										id='channel-users'
 										// onClick={() => goProfile(user)} // profiller oluşturulmadığı için yok.
 									>
 										<img src={user.imageUrl} alt={user.imageUrl} />
 										<span>{user.login}</span>
 									</div>
 								))}
 								<button id="userAdd" onClick={() => setActiveTabInfo('infoFriends')}> <IconAddUser /> </button>
 							</div>
 						)}

 						{ activeTabInfo === 'infoChannel' && (
 							<div>
 								<label htmlFor="channelName">Channel Name:</label>
 								<input
									ref={inputRefUpdateChannelName}
									type="text"
									placeholder="Edit Channel Name..."
 								/>
 								<button onClick={handleUpdateChannelName}>
 									Update Channel Name
 								</button>


 								<button
									id='leaveButton'
									onClick={() => {handleChannelLeave(activeChannel.name)}}
									>
 									Leave Channel
 								</button>
 								<button
									id='deleteButton'
									onClick={() => {handleChannelDelete(activeChannel.name)}}
									>
 									Delete Channel
 								</button>
 							</div>
 						)}

 						{ activeTabInfo === 'infoFriends' && (
 							<div>
 								<input
 									id="friendSearch"
 									type="text"
 									value={friendSearchTerm}
 									onChange={(e) => setFriendSearchTerm(e.target.value)}
 									placeholder="Search friends..."
 								/>
 								{friendList
 									.filter((user) => user.name.toLowerCase().includes(friendSearchTerm.toLowerCase()))
 									.map((user) => (
 										<div
 											key={user.name}
 											id='friend-users'
 										>
 											<img src={user.image} alt={user.image} />
 											<div id='friend-users-table'>
 												<span>{user.name}</span>
 												<span>Status: {user.status}</span>
 											</div>
 										</div>
 								))}
 							</div>
 						)}

 					</div>
 				</div>
 			)}
 		</>
 	);
 }

 export default InfoChannel;