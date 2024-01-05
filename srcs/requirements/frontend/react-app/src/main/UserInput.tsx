import { useRef, useState } from 'react';
import { useUser } from '../hooks/UserHook';
import './UserInput.css';
import fetchRequest from '../utils/fetchRequest';

interface IUserProps{
	setVisible: (value: boolean) => void,
}

function UserInput({setVisible}: IUserProps) {
	const user = useUser();
	const [selectedAvatar, setSelectedAvatar] = useState<File | null>(null);
	const inputRefNickname = useRef<HTMLInputElement>(null);
	const inputRefAvatar = useRef<HTMLInputElement>(null);

	const handleSubmit = async (event: any) => {
		event.preventDefault();
		const nickname = inputRefNickname.current?.value;
		const formData = new FormData();
		formData.append('image', selectedAvatar as File);

		const responseAvatar = await fetchRequest({
			method: 'PUT',
			body: formData,
			url: `/users/user/upload`
		});
		if (responseAvatar.ok){
			const avatarUrl = await responseAvatar.json();
			if (!avatarUrl.err){
				const responseUserCustomize = await fetchRequest({
					method: 'PATCH',
					body: JSON.stringify({ nickname: nickname, avatar: avatarUrl.imgUrl }),
					url: `/users/user?user=${user.userInfo?.login}`
				});
				if (!responseUserCustomize.ok)
					alert("User Customize screen update error.");
			}
		} else {
			console.error("Error: image not uploaded!");
		}

		localStorage.removeItem('userLoginPage');
		setVisible(false);
	};

	const handleClose = () => {
		localStorage.removeItem('userLoginPage');
		setVisible(false);
	}

	const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const files = event.target.files;

		if (files && files.length > 0) {
			const file = files[0];
	  
		  	if (!file.type.startsWith('image/')) {
				console.error('Lütfen bir resim dosyası seçin.');
				return;
		  	}
	  
			setSelectedAvatar(file);
		} else {
			setSelectedAvatar(null);
		}
	};

	return (
		<div id="user-customize">
			<form onSubmit={handleSubmit}>
				<div id="close" onClick={handleClose} title='Close'>X</div>
				<label htmlFor="Nickname">Set Nickname:</label>
				<input
					id='Nickname'
					type="text"
					ref={inputRefNickname}
					placeholder="Set Nickname..."
				/>
				<label htmlFor="Avatar">Set Avatar:</label>
				<input
					id='Avatar'
					ref={inputRefAvatar}
					name="image"
					type="file"
					accept="image/jpg, image/jpeg, image/png, image/gif"
					onChange={handleAvatarChange}
				/>
				{selectedAvatar && (
					<img 
						src={URL.createObjectURL(selectedAvatar)}
						alt={selectedAvatar.name}
						id="channel-image-output"
					/>
				)}
				<button id='save' type="submit" >Save Settings</button>
			</form>
		</div>
	);
}

export default UserInput;