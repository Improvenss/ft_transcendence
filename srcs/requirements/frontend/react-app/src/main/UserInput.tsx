import { useState } from 'react';
import './UserInput.css';

interface IUserProps{
	setVisible: (value: boolean) => void,
}

function UserInput({setVisible}: IUserProps) {
	const [username, setUsername] = useState('');
	const [selectedFile, setSelectedFile] = useState(null);

	const handleUsernameChange = (event: any) => {
		setUsername(event.target.value);
	};

	const handleFileChange = (event: any) => {
		setSelectedFile(event.target.files[0]);
	};

	const handleSubmit = (event: any) => {
		event.preventDefault();
		// Burada dosyayı sunucuya yüklemek için bir işlem yapabilirsiniz.
		console.log('Kullanıcı adı: ', username);
		console.log('Seçilen dosya: ', selectedFile);
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
