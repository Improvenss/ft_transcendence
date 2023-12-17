import Cookies from 'js-cookie';
import { useState } from 'react';
import { useUser } from '../hooks/UserHook';
import './UserInput.css';

interface IUserProps{
	setVisible: (value: boolean) => void,
}

function UserInput({setVisible}: IUserProps) {
	const user = useUser();
	const userCookie = Cookies.get('user');
	const [username, setUsername] = useState('');
	const [selectedFile, setSelectedFile] = useState(null);

	const handleUsernameChange = (event: any) => {
		setUsername(event.target.value);
	};

	const handleFileChange = (event: any) => {
		setSelectedFile(event.target.files[0]);
	};

	const handleSubmit = async (event: any) => {
		event.preventDefault();
		// Burada dosyayı sunucuya yüklemek için bir işlem yapabilirsiniz.
		console.log('Kullanıcı adı: ', username); // nickname
		console.log('Seçilen dosya: ', selectedFile); // avatar
		const	responseUserCustomize = await fetch(
			process.env.REACT_APP_FETCH
				+ `/users/user?user=${user.userInfo?.login}`, { // Buradaki userInfo? olayi bug yaratabilir gibi. ama yaratmayadabilir.
			method: 'PATCH',
			headers: {
				"Content-Type": "application/json",
				"Authorization": "Bearer " + userCookie as string,
			},
			body: JSON.stringify({
				nickname: username,
				// avatar: selectedFile,
			}),
		});
		if (!responseUserCustomize.ok)
			alert("User Customize screen update error.");
		localStorage.removeItem('userLoginPage');
		setVisible(false);
	};

	const handleClose = () => {
		localStorage.removeItem('userLoginPage');
		setVisible(false);
	}

	return (
		<div id="user-customize">
			<form onSubmit={handleSubmit}>
				<div id="close" onClick={handleClose} title='Close'>X</div>
				<label>
					Nickname:
					<input type="text" value={username} onChange={handleUsernameChange} />
					<br />
				</label>
				<label>
					Upload image:
					<input type="file" onChange={handleFileChange} />
					<br />
				</label>
					<button id='save' type="submit" >Save Settings</button>
			</form>
		</div>
	);
}

export default UserInput;
