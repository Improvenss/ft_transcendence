import { ChangeEvent, FormEvent, useState } from 'react';
import Modal from "../utils/Modal";
import { ReactComponent as IconSettings } from '../assets/iconSettings.svg';
import { isValidImage } from '../utils/fileValidation';
import fetchRequest from '../utils/fetchRequest';
import { IUserProps } from '../chat/iChannel';
import "./Settings.css";

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

function Settings({userInfo}: {userInfo: IUserProps }) {
	console.log("---------SETTINGS---------");
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
					</div>

				</div>
			</Modal>
		</div>
	);
}

export default Settings;
