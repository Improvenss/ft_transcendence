import { useRef, useState } from "react";
import { IUser } from "./iChannel";
import { ReactComponent as IconUsers } from '../assets/chat/iconUsers.svg';
import { ReactComponent as IconSettings } from '../assets/chat/iconSettings.svg';
import { ReactComponent as IconAddUser } from '../assets/chat/iconAddUser.svg';
import { ReactComponent as IconBanList } from '../assets/chat/iconBanList.svg';
import { ReactComponent as IconProfile } from '../assets/chat/iconProfile.svg';
import { ReactComponent as IconDM } from '../assets/chat/iconDM.svg';
import { ReactComponent as IconKick } from '../assets/chat/iconKick.svg';
import { ReactComponent as IconBan } from '../assets/chat/iconBan.svg';
import { ReactComponent as IconAddFriend } from '../assets/chat/iconAddFriend.svg';
import { ReactComponent as IconInviteGame } from '../assets/chat/iconInviteGame.svg';
import './ChannelInfo.css';
import { useChannelContext } from "./ChatPage";
import Cookies from "js-cookie";
import { useUser } from "../hooks/UserHook";
import { useNavigate } from "react-router-dom";

 function InfoChannel() {
	const { activeChannel, setActiveChannel, channelInfo } = useChannelContext();
	const userCookie = Cookies.get("user");
	const my = useUser().userInfo;
 	const [activeTabInfo, setActiveTabInfo] = useState('infoUsers');
 	const [userSearchTerm, setUserSearchTerm] = useState('');
 	const [friendSearchTerm, setFriendSearchTerm] = useState('');
 	const [banSearchTerm, setBanSearchTerm] = useState('');
	const inputRefName = useRef<HTMLInputElement>(null);
	const inputRefDescription = useRef<HTMLInputElement>(null);
	const inputRefImage = useRef<HTMLInputElement>(null);
	const inputRefPassword = useRef<HTMLInputElement>(null);
	const [showUserInfo, setShowUserInfo] = useState<IUser | null>(null);
	const [selectedImage, setSelectedImage] = useState<File | null>(null);
	const [errorMessage, setErrorMessage] = useState('');
	const navigate = useNavigate();

	// User kendisi Leave Channel dediginde calisir admin icin kick olarak baska function yapacagiz.
	const	handleChannelLeave = async (selectedChannel: string) => {
		console.log(`User leave ${selectedChannel} channel`);
		const responseChannelLeave = await fetch(process.env.REACT_APP_FETCH + `/chat/channel/leave?channel=${selectedChannel}`, {
			method: 'POST', // ya da 'POST', 'PUT', 'DELETE' gibi isteğinize uygun HTTP metodunu seçin
			headers: {
				'Content-Type': 'application/json',
				"Authorization": "Bearer " + userCookie,
				"channel": selectedChannel,
			},
		});
		if (!responseChannelLeave.ok) {
			throw new Error('API-den veri alınamadı.');
		}
		const data = await responseChannelLeave.json();
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
		if (selectedImage != null)
			setSelectedImage(null);
 		setActiveTabInfo(tabId);
 		// Implement logic to update content based on the selected tab
 		// For now, let's just log a message to the console
 		console.log(`Switched to channel ${tabId}`);
 	};

	const handleUpdate = async (fieldName: string) => {
		const formData = new FormData();

		switch (fieldName) {
			case 'channelName':
				if (inputRefName.current) {
					const channelName = inputRefName.current.value.trim();
					if (channelName) {
						formData.append(fieldName, (inputRefName.current?.value) as string );
						inputRefName.current.value = ''; // Clear the input field
					} else {
						console.error('Channel Name can not be empty!');
						setErrorMessage('Channel Name can not be empty!');
						return;
					}
				}
			break;
			case 'channelDescription':
				if (inputRefDescription.current) {
					formData.append(fieldName, (inputRefDescription.current?.value) as string );
					inputRefDescription.current.value = '';
				}
			break;
			case 'channelImage':
				if (inputRefImage.current?.files){
					const selectedImage = inputRefImage.current.files[0];
					if (selectedImage) {
						formData.append(fieldName, selectedImage);
						inputRefImage.current.value = '';
						setSelectedImage(null);
					} else {
						console.error('Channel Image can not be empty!');
						setErrorMessage('Channel Image can not be empty!');
						return;
					}
				}
			break;
			case 'channelPassword':
				if (inputRefPassword.current) {
					formData.append(fieldName, (inputRefPassword.current?.value) as string );
					inputRefPassword.current.value = '';
				}
			break;
		default:
			break;
		}

		const	responseChannelCustomize = await fetch(
			process.env.REACT_APP_FETCH + `/chat/channel?channel=${activeChannel?.name}`, {
			method: 'PATCH',
			headers: {
				"Authorization": "Bearer " + userCookie as string,
				"channel": activeChannel?.name || "",
			},
			body: formData,
		});
		if (!responseChannelCustomize.ok)
			console.log("Channel Customize screen update error.");

		if (errorMessage != null)
			setErrorMessage('');
	};

	const handleInfo = async (action: string, targetUser: string) => {
		if (!activeChannel || !my)
			return;
		console.log("me:", my.login, "- channel:", activeChannel.name);
		let url = '';
		switch (action) {
			case 'goProfile':
				navigate('/profile/' + targetUser);
				return;
			case 'addFriend':
				console.log(`User[${my.login}] sending friend request to 'user[${targetUser}]'.`);
				url = `/users/friend/add?user=${targetUser}`;
				break;
			case 'directMessage':
				console.log(action);
				break;
			case 'inviteGame':
				console.log(action);
				break;
			case 'userKick':
				console.log(`User[${targetUser}] kick from channel[${activeChannel.name}]`);
				url = `/chat/channel/kick?user=${targetUser}`;
				break;
			case 'userBan':
				console.log(`User[${targetUser}] banned from channel[${activeChannel.name}]`);
				url = `/chat/channel/ban?user=${targetUser}`;
				break;
			case 'userUnban':
				console.log(`User[${targetUser}] was unbanned from channel[${activeChannel.name}]`);
				url = `/chat/channel/unban?user=${targetUser}`;
				break;
			case 'setAdmin':
				console.log(action);
				break;
			case 'removeAdmin':
				console.log(action);
				break;
			default:
				break;
		}

		const response = await fetch(process.env.REACT_APP_FETCH + url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				"Authorization": "Bearer " + userCookie,
				"channel": activeChannel.name,
			},
		});
		if (!response.ok) {
			throw new Error('API-den veri alınamadı.');
		}
		const data = await response.json();
		console.log("HandleInfo:", data);
	}

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
 							{activeTabInfo === 'banList' && <h1>Banned Users</h1>}
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
											<img src={user.avatar ? user.avatar : user.imageUrl} alt={user.login}/>
											<span>{user.nickname ? user.nickname : user.login}</span>
											<span className={`status-indicator status-${user.status.toLowerCase()}`}></span>
										</div>
										{(showUserInfo && showUserInfo.login === user.login) && (
											<div id="channel-user-info">
												<button onClick={() => handleInfo('goProfile', user.login)}> <IconProfile /> </button>
												{user.login !== my?.login && (
													<>
														<button onClick={() => handleInfo('addFriend', user.login)}> <IconAddFriend /> </button>
														<button onClick={() => handleInfo('directMessage', user.login)}> <IconDM /> </button>
														<button onClick={() => handleInfo('inviteGame', user.login)}> <IconInviteGame /> </button>
													</>
												)}
												{activeChannel.admins.some((admin) => admin.login === my?.login) && (
													<>
														{user.login !== my?.login && (
															<>
																<button onClick={() => handleInfo('userKick', user.login)}> <IconKick /> </button>
																<button onClick={() => handleInfo('userBan', user.login)}> <IconBan /> </button>
															</>
														)}
														{activeChannel.admins.some((admin) => admin.login === user.login) ? (
															<button onClick={() => handleInfo('removeAdmin', user.login)}>Remove Admin</button>
														) : (
															<button onClick={() => handleInfo('setAdmin', user.login)}>Set Admin</button>
														)}
													</>
												)}
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
								{activeChannel.admins.some((admin) => admin.login === my?.login) ? (
									<>
										{errorMessage && <p className="error-message">{errorMessage}</p>}
										<label htmlFor="channelName">Channel Name:</label>
										<input
											id="channelName"
											ref={inputRefName}
											type="text"
											placeholder="Change Name..."
										/>
										<button onClick={() => handleUpdate('channelName')}>Change Name </button>
										<label htmlFor="channelDescription">Channel Description:</label>
										<input
											id="channelDescription"
											ref={inputRefDescription}
											type="text"
											placeholder="Change Description..."
										/>
										<button onClick={() => handleUpdate('channelDescription')}>Change Description </button>
										<label htmlFor="channelImage">Channel Image:</label>
										<input
											id="channelImage"
											ref={inputRefImage}
											type="file"
											accept="image/jpg, image/jpeg, image/png, image/gif"
											onChange={(e) => {
												const selectedFile = e.target.files && e.target.files.length > 0 ? e.target.files[0] : null;
												if (selectedFile && selectedFile.type.startsWith('image/'))
													setSelectedImage(selectedFile);
												else if (inputRefImage.current) {
													inputRefImage.current.value = '';
													setSelectedImage(null);
												}
											}}
										/>
										{selectedImage && (
											<img
												src={URL.createObjectURL(selectedImage)}
												alt="Selected File"
											/>
										)}
										<button onClick={() => handleUpdate('channelImage')}>Change Image </button>
										<label htmlFor="channelPassword">Channel Password:</label>
										<input
											id="channelPassword"
											ref={inputRefPassword}
											type="password"
											placeholder="Change Password..."
										/>
										<button onClick={() => handleUpdate('channelPassword')}>Change Password </button>

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
									</>
								) : (
									<button
										id='leaveButton'
										onClick={() => {handleChannelLeave(activeChannel.name)}}
									>
										Leave Channel
									</button>
								)}
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
 								{my?.friends
 									.filter((user) => user.login.toLowerCase().includes(friendSearchTerm.toLowerCase()))
 									.map((user) => (
 										<div
 											key={user.login}
 											id='friend-users'
 										>
 											<img src={user.avatar ? user.avatar : user.imageUrl} alt={user.login}/>
 											<div id='friend-users-table'>
 												<span>{user.nickname ? user.nickname : user.login}</span>
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
 								{activeChannel.bannedUsers
 									.filter((user) => user.login.toLowerCase().includes(banSearchTerm.toLowerCase()))
 									.map((user) => (
 										<div
 											key={user.login}
 											id='banned-users'
											onClick={() => handleInfo('userUnban', user.login)}
 										>
 											<img src={user.imageUrl} alt={user.imageUrl} />
 											<div id='banned-users-table'>
 												<span>{user.login}</span>
 												<span className={`status-indicator status-${user.status.toLowerCase()}`}></span>
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