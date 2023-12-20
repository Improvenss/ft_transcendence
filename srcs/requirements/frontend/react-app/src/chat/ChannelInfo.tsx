import { useRef, useState } from "react";
import { IFriend, IUser } from "./iChannel";
import { ReactComponent as IconUsers } from '../assets/chat/iconUsers.svg';
import { ReactComponent as IconSettings } from '../assets/chat/iconSettings.svg';
import { ReactComponent as IconAddUser } from '../assets/chat/iconAddUser.svg';
import { ReactComponent as IconBanList } from '../assets/chat/iconBanList.svg';
import { ReactComponent as IconProfile } from '../assets/chat/iconProfile.svg';
import { ReactComponent as IconDM } from '../assets/chat/iconDM.svg';
import { ReactComponent as IconKick } from '../assets/chat/iconKick.svg';
import { ReactComponent as IconBan } from '../assets/chat/iconBan.svg';
import './ChannelInfo.css';
import { useChannelContext } from "./ChatPage";
import Cookies from "js-cookie";

 function InfoChannel() {
	// { selectedChannel, isInfoChannelActive, setIsInfoChannelActive }: IOnChannelProps
	const { activeChannel, setActiveChannel, channelInfo, setChannelInfo } = useChannelContext();
	const userCookie = Cookies.get("user");
 	const [activeTabInfo, setActiveTabInfo] = useState('infoUsers');
 	const [userSearchTerm, setUserSearchTerm] = useState('');
 	const [friendSearchTerm, setFriendSearchTerm] = useState('');
 	const [banSearchTerm, setBanSearchTerm] = useState('');
 	const [friendList, setFriendList] = useState<IFriend[]>( () => {
 		const fetchFriendList: IFriend[] = [
 			{ name: 'uercan', status: 'offline', image: '/dogSlayer.png' },
 			{ name: 'gsever', status: 'online', image: '/heart.jpg' },
 			{ name: 'Admin', status: 'AFK', image: '/watcher.jpg' }
 		];
 		return (fetchFriendList);
 	});
	const inputRefName = useRef<HTMLInputElement>(null);
	const inputRefDescription = useRef<HTMLInputElement>(null);
	const inputRefImage = useRef<HTMLInputElement>(null);
	const inputRefPassword = useRef<HTMLInputElement>(null);
	const [showUserInfo, setShowUserInfo] = useState<IUser | null>(null);

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

	 const handleUpdate = (id: number) => {
		// !!channel settings kısmında her ayarın kendisine özel set yapısı olmalıdır.
		// channal name - channel description - channe image 
		// channel password ekleme (password varsa private olarak devam edecek, yoksa public olarak setlenecek)
		let inputValue = null;

		switch (id) {
		  case 1:
			inputValue = inputRefName.current?.value;
			break;
		  case 2:
			inputValue = inputRefDescription.current?.value;
			break;
		  case 3:
			inputValue = inputRefImage.current?.value;
			break;
		  case 4:
			inputValue = inputRefPassword.current?.value;
			break;
		  default:
			break;
		}
	
		console.log(`ID: ${id}, Girilen Değer: ${inputValue}`);
	  };

	/*
		channel users'a banlı kullanıcıları gösteren bir sticky ekle, sadece admin görebilsin.
		channel users'daki kullancıların üzerinde etkileşim eklenmelidir, bu etkişleşimler: kullanıcıyı kickleme - banlama - admin yapma - adminlikten çıkarma, profiline gitme, özel mesaj yazma olacaktır, kullanıcı status durumu olacaktır.
			Bu özelliklerden kickleme - banlama - admin set unset yapıları sadece admin tarafından görülecek ve etkileşime girilecektir.
			Bu etkileşim modal olabilir.
		---------------------
		??Channel, active channel, channel info kısmına girince yapıların divleri genişleyecek ve daralacak şekilde ayarla.

	*/

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
 							{activeTabInfo === 'banList' && <h1>Ban List</h1>}
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
 									>
										<div
											id="channel-user"
											onClick={() => setShowUserInfo((prevUser) => (prevUser === user ? null : user))}
										>
											<img src={user.imageUrl} alt={user.imageUrl} />
											<span>{user.login}</span>
											{/*{
												kullanıcı statü durumu online-offline-ingame
												nickname eklenmelidir
												avatarı varsa avatarı gösterilmelidir.
											}*/}
										</div>
										{(showUserInfo && showUserInfo.login == user.login) && (
											<div id="channel-user-info">
												<button id="goProfile"> <IconProfile /> </button>
												<button id="DM"> <IconDM /> </button>
												<button id="userKick"> <IconKick /> </button>
												<button id="userBan"> <IconBan /> </button>
												<button id="setAdmin">Set Admin</button>
												<button id="removeAdmin">Remove Admin</button>
											</div>
										)}
 									</div>
 								))}
 								<button id="userAdd" onClick={() => setActiveTabInfo('infoFriends')}> <IconAddUser /> </button>
 								<button id="userBanList" onClick={() => setActiveTabInfo('banList')}> <IconBanList /> </button>
 							</div>
 						)}

 						{ activeTabInfo === 'infoChannel' && (
 							<div className="settings">
 								<label htmlFor="channelName">Channel Name:</label>
 								<input
									ref={inputRefName}
									type="text"
									placeholder="Change Name..."
 								/>
 								<button onClick={() => handleUpdate(1)}>Change Name </button>
 								<label htmlFor="channelDescription">Channel Description:</label>
 								<input
									ref={inputRefDescription}
									type="text"
									placeholder="Change Description..."
 								/>
 								<button onClick={() => handleUpdate(2)}>Change Description </button>
 								<label htmlFor="channelImage">Channel Image:</label>
 								<input
									ref={inputRefImage}
									type="file"
									accept="image/jpg, image/jpeg, image/png, image/gif"
 								/>
 								<button onClick={() => handleUpdate(3)}>Change Image </button>
 								<label htmlFor="channelPassword">Channel Password:</label>
 								<input
									ref={inputRefPassword}
									type="password"
									placeholder="Change Password..."
 								/>
 								<button onClick={() => handleUpdate(4)}>Change Password </button>



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

						{ activeTabInfo === 'banList' && (
 							<div>
 								<input
 									id="banSearch"
 									type="text"
 									value={banSearchTerm}
 									onChange={(e) => setBanSearchTerm(e.target.value)}
 									placeholder="Search banned users..."
 								/>
 								{friendList
 									.filter((user) => user.name.toLowerCase().includes(banSearchTerm.toLowerCase()))
 									.map((user) => (
 										<div
 											key={user.name}
 											id='banned-users'
 										>
 											<img src={user.image} alt={user.image} />
 											<div id='banned-users-table'>
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