import { ChangeEvent, FormEvent, useState } from 'react';
import './UserInput.css';
import fetchRequest from '../utils/fetchRequest';
import { isValidImage } from '../utils/fileValidation';

interface IUserUpdateForm {
	nickname: string;
	image: File | null; //avatar
}

const defaultForm: IUserUpdateForm = {
	nickname: '',
	image: null, //avatar
}

interface IUserProps{
	setVisible: (value: boolean) => void,
}

function UserInput({setVisible}: IUserProps) {
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [userData, setUserData] = useState<IUserUpdateForm>(defaultForm);
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
				localStorage.removeItem('userLoginPage');
				setVisible(false);
				formElement.reset();
			}
		} else {
			console.log("User not updated!");
		}
	};

	const handleClose = () => {
		localStorage.removeItem('userLoginPage');
		setVisible(false);
	}

	return (
		<div id="user-customize">
			<form onSubmit={handleSubmit}>
				{errorMessage && <p className="error-message">{errorMessage}</p>}
				<div id="close" onClick={handleClose} title='Close'>X</div>
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
	);
}

export default UserInput;