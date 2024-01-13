import { ChangeEvent, FormEvent, useState } from 'react';
import Modal from "./utils/Modal";
import { ReactComponent as IconSettings } from './assets/iconSettings.svg';
import "./Settings.css";
import { isValidImage } from './utils/fileValidation';
import fetchRequest from './utils/fetchRequest';
import { useUser } from './hooks/UserHook';
import { IUserProps } from './chat/iChannel';

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
			}
		} else {
			console.log("User not updated!");
		}
	};

	const handleTabClick = (tab: Tab) => {
		setActiveTab(tab);
	};

	const handle2FA = async (userLogin: string) => {
		try {
			const response = await fetchRequest({
				method: "POST",
				url: `/users/set/2fa`,
			});
			const data = await response.json();
			// QR kodunu al
			console.log("qrcode", data.qrCode);
			setQrCodeImageUrl(data.qrCode);
		} catch (err) {
			console.error("Error setting up 2FA:", err);
			return (err);
		}
	}

	const handleEnable2FA = async (sixDigitCode: string) => {
		try {
			const response = await fetchRequest({
				method: "POST",
				url: `/users/verify/2fa/${sixDigitCode}`,
			});
			const data = await response.json();
			console.log("Is verified???? ->>>>", data);
		} catch (err) {
			console.error("Error verifying 2FA:", err);
			return (err);
		}
	}

	const handleDisable2FA = async (code: string) => {
		
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
						<h3>Set Two-Factor Authentication (2FA)</h3>
						{/*
							//--> QR kodu bir defaya mahsus verilmelidir.
							//--> Verilen QR koddaki kodu 2FA etkinleştirmek için girerse eğer artık kullanıcın her girişinde 2FA çalışacaktır.
							//--> Bu QR kod kullanıcıya kayıt edilir. 
							//--> 2FA'yı kapatmak için ayarlardan elindeki kodu 2FA kapatma yerine girip kapatmalıdır.
							//--> QR kod kapatıldığında kullanıcıdan silinir.
							//--> Her etkinleştirip kapatmada yeni bir QR kod sunulur.
						*/}
						{!userInfo.twoFactorAuthIsEnabled && (
							<>
								<button id="create-2FA" onClick={() => handle2FA(userInfo.login)}>Create new QR Code</button>
								<img id="qrCodeImage" src={qrCodeImageUrl} alt="QR Code" />
							</>
						)}
						<input
							id="2FAcode"
							type="text"
							value={qrCode}
							onChange={(e) => setQrCode(e.target.value)}
							placeholder="Enter 6 digit code..."
						/>
						{userInfo.twoFactorAuthIsEnabled ? (
							<button id='disable-2FA' onClick={() => handleDisable2FA(qrCode)}>Disable</button>
						) : (
							<button id='enable-2FA' onClick={() => handleEnable2FA(qrCode)}>Enable</button>
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
