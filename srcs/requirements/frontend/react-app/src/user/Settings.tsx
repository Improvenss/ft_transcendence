import { ChangeEvent, FormEvent, useState } from 'react';
import Modal from "../utils/Modal";
import { ReactComponent as IconSettings } from '../assets/iconSettings.svg';
import { isValidImage } from '../utils/fileValidation';
import fetchRequest from '../utils/fetchRequest';
import "./Settings.css";
import { useUser } from '../hooks/UserHook';

interface IUserUpdateForm {
	nickname: string;
	image: File | null; //avatar
}

const defaultForm: IUserUpdateForm = {
	nickname: '',
	image: null, //avatar
}

enum Tab {
	UserCustomize = 'user-customize',
	TwoFactorAuth = 'two-factor-auth',
	Contact = 'contact',
	About = 'about',
}

function Settings() {
	console.log("---------SETTINGS---------");
	const {userInfo} = useUser();
	const [isModalOpen, setModalOpen] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [userData, setUserData] = useState<IUserUpdateForm>(defaultForm);
	const [activeTab, setActiveTab] = useState(Tab.UserCustomize);
	const [qrCodeImageUrl, setQrCodeImageUrl] = useState('');
	const [qrCode, setQrCode] = useState('');
	const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
		const { name, value } = e.currentTarget;
		const file = (e.target instanceof HTMLInputElement && e.target.files) ? e.target.files[0] : null;
	
		if (name === 'image' && file) {
			const validResult = isValidImage(file);
			if (validResult.status === false){
				e.target.value = ''; // Hatalı resim seçildiğinde dosyanın adını temizle
				setErrorMessage(validResult.err);
				setUserData(prevData => ({ ...prevData, image: null }));
			} else {
				setUserData(prevData => ({ ...prevData, image: file }));
				setErrorMessage(null);
			}
		} else {
			setUserData(prevData => ({ ...prevData, [name]: value }));
		}
	};


	const handleSubmit = async (event: FormEvent) => {
		event.preventDefault();
		const formElement = event.currentTarget as HTMLFormElement;

		const formData = new FormData();
		formData.append('nickname', userData.nickname);
		formData.append('avatar', userData.image as File);

		const response = await fetchRequest({
			method: 'PATCH',
			body: formData,
			url: '/users/user'
		});
		if (response.ok){
			const data = await response.json();
			if (!data.err){
				formElement.reset();
				setUserData(prevData => ({ ...prevData, image: null }));
			}
		} else {
			console.log("User not updated!");
		}
	};

	const handleTabClick = (tab: Tab) => {
		setActiveTab(tab);
		if (errorMessage)
			setErrorMessage(null);
	};

	const handle2FAAction = async (action: 'create' | 'enable' | 'disable') => {
		if (action === 'enable' || action === 'disable') {
			if (qrCode.length !== 6) {
				setErrorMessage('QR Code must be 6 digits long.');
				return;
			}
		}
		const response = await fetchRequest({
			method: 'POST',
			body: (action === 'create' ? undefined : JSON.stringify({code: qrCode})),
			url:  `/users/2fa/${action}`,
		});
		if (response.ok){
			const data = await response.json();
			console.log("handle2FAAction:", data);
			if (!data.err){
				if (action === 'create')
					setQrCodeImageUrl(data.qrCode);
			} else {
				console.log("handle2FAAction err:", data.err);
				setErrorMessage(data.err);
			}
		} else {
			console.log("---Backend Connection '❌'---");
		}
	}

	return (
		<div id="settings">
			
			<div className={`settings-container ${isModalOpen ? 'open' : null}`} onClick={() => setModalOpen(!isModalOpen)}>
				<IconSettings id='icon-settings'/>
			</div>

			<Modal
				isOpen={isModalOpen}
				onClose={() => setModalOpen(false)}
				mouse={true}
				overlayClassName='settings-overlay'
				modalClassName='settings-modal'
				closeButtonClassName='settings-close-button'
			>
				<div id='settings-content'>
					<div className='settings-content-tab'>
						<button className={`tablink ${activeTab === Tab.UserCustomize ? 'active' : ''}`} onClick={() => handleTabClick(Tab.UserCustomize)}>
							User customize
						</button>
						<button className={`tablink ${activeTab === Tab.TwoFactorAuth ? 'active' : ''}`} onClick={() => handleTabClick(Tab.TwoFactorAuth)}>
							2FA
						</button>
						<button className={`tablink ${activeTab === Tab.Contact ? 'active' : ''}`} onClick={() => handleTabClick(Tab.Contact)}>
							Contact
						</button>
						<button className={`tablink ${activeTab === Tab.About ? 'active' : ''}`} onClick={() => handleTabClick(Tab.About)}>
							About
						</button>
					</div>

					<div id={Tab.UserCustomize} className={`tabcontent ${activeTab === Tab.UserCustomize ? 'active' : ''}`}>
						<h3>User optional customize</h3>
						<form onSubmit={handleSubmit}>
							{errorMessage && <p className="error-message">{errorMessage}</p>}
							<label htmlFor="nickname">Set Nickname:</label>
							<input
								id='nickname'
								type="text"
								name="nickname"
								placeholder="Set Nickname..."
								onChange={handleInputChange}
							/>
							<label htmlFor="image">Set Avatar:</label>
							<input
								id='image'
								type="file"
								name="image"
								accept="image/jpg, image/jpeg, image/png, image/gif"
								onChange={handleInputChange}
							/>
							{userData.image && (
								<img 
									src={URL.createObjectURL(userData.image)}
									alt={userData.image.name}
									id="avatar-output"
								/>
							)}
							<button id='save' type="submit" >Save Settings</button>
						</form>
					</div>
					<div id={Tab.TwoFactorAuth} className={`tabcontent ${activeTab === Tab.TwoFactorAuth ? 'active' : ''}`}>
						<h3>Set Two-Factor Authentication (2FA) status</h3>
						{errorMessage && <p className="error-message">{errorMessage}</p>}
						{userInfo.twoFactorAuthIsEnabled ? (
							<>
								<input
									id="two-FAcode"
									type="text"
									value={qrCode}
									onChange={(e) => setQrCode(e.target.value)}
									placeholder="Enter 6 digit code for disable..."
								/>
								<button id='disable-2FA' onClick={() => handle2FAAction("disable")}>Disable 2FA</button>
							</>
						) : (
							<>
								<h3 className="info-text">Generate a new QR code for 2FA. Warning: Any previously created QR code structure will be removed.</h3>
								<button id="create-2FA" onClick={() => handle2FAAction("create")}>Create new QR Code</button>
								{qrCodeImageUrl ? (
									<img id="qrCodeImage" src={qrCodeImageUrl} alt="QR Code" />
								) : (
									<h3 className="info-text">If you have previously created and saved a QR code, you can use that code.</h3>
								)}
								<input
									id="two-FAcode"
									type="text"
									value={qrCode}
									onChange={(e) => setQrCode(e.target.value)}
									placeholder="Enter 6 digit code for enable..."
								/>
								<button id='enable-2FA' onClick={() => handle2FAAction("enable")}>Enable 2FA</button>
							</>
						)}
					</div>
					<div id={Tab.Contact} className={`tabcontent ${activeTab === Tab.Contact ? 'active' : ''}`}>
						<h3>Contact</h3>

					</div>
					<div id={Tab.About} className={`tabcontent ${activeTab === Tab.About ? 'active' : ''}`}>
						<h3>About</h3>
						<p>Structures implemented in the project:
							<ul>
								<li>Chat</li>
								<ul>
									<li>Public Channels</li>
										<ul>
											<li>Every user can see this channel.</li>
											<li>You can subscribe to the channel from the "Public Channels" tab.</li>
										</ul>
									<li>Private Channels</li>
										<ul>
											<li>You can log in only with "Join Channel".</li>
											<li>Channel name and password must be known.</li>
										</ul>
									<li>Channel Create</li>
										<ul>
											<li>You can crate Public/Private channels.</li>
											<li>Channel name, type and image are required.</li>
											<li>You can determine the topic of the channel.</li>
										</ul>
									<li>Channel Join</li>
										<ul>
											<li>You can log private/public channels.</li>
											<li>Since public channels do not require a password, you can enter the password randomly.</li>
										</ul>
									<li>Channel Customize</li>
										<ul>
											<li>You can ... users.</li>
											<ul>
												<li>if admin</li>
													<ul>
														<li>Ban</li>
														<li>Unban</li>
														<li>Kick</li>
														<li>Set Admin</li>
														<li>Remove Admin</li>
													</ul>
												<li>if normal user</li>
													<ul>
														<li>Sending Direct Message</li>
														<li>Sending Friend Request</li>
														<li>Invite The Game</li>
														<li>Go to User Profile</li>
													</ul>
											</ul>
											<li>You can ... the channel.</li>
												<ul>
													<li>if admin</li>
														<ul>
															<li>Name</li>
															<li>Description</li>
															<li>Image</li>
															<li>Password</li>
															<li>Delete</li>
														</ul>
													<li>if normal user</li>
														<ul>
															<li>Leave</li>
														</ul>
												</ul>
										</ul>
									<li>Direct Message</li>
										<ul>
											<li>You can create direct message in chat-page/profile-page with "Send Message" button.</li>
											<li>When leave the direct message, messages not removed.</li>
										</ul>
								</ul><br />
								<li>Game</li>
								<ul>
									<li>Public Games</li>
									<li>Private Games</li>
									<li>Game Join</li>
									<li>Game Customize</li>
									<li>Matchmaking</li>
								</ul><br />
								<li>User</li>
								<ul>
									<li>Profile Page</li>
										<ul>
											<li>You can go to other users' and your own profile.</li>
											<li>You can see your friends, game statistics and achievements on your profile.</li>
											<li>You can see game statistics and achievements on other users' profiles.</li>
											<li>You can perform friend requests, unfriends and send private messages from other users' profiles.</li>
										</ul>
									<li>Notification</li>
										<ul>
											<li>You may receive errors, inappropriate usage and informational messages.</li>
										</ul>
									<li>User Customize</li>
										<ul>
											<li>You can choose a user nickname and avatar according to your own preference.</li>
										</ul>
									<li>Friend List</li>
										<ul>
											<li>You can see your friends.</li>
											<li>When you click on your friends, you can go to their profiles.</li>
										</ul>
									<li>Two-factory Authentication</li>
										<ul>
											<li>A two-step verification code is requested every time you log in.</li>
											<li>It is also requested when you log out.</li>
										</ul>
								</ul><br />
							</ul>
						</p>
					</div>

				</div>
			</Modal>
		</div>
	);
}

export default Settings;