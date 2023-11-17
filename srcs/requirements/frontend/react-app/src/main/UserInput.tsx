import React, { useState } from 'react';
import './UserInput.css';

function UserInput() {
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
	};

	return (
	<div id="user-status">
		<form onSubmit={handleSubmit}>
		<label>
			Kullanıcı Adı:
			<input type="text" value={username} onChange={handleUsernameChange} />
		</label>
		<label>
			<br></br>
			Resim Yükle:
			<input type="file" onChange={handleFileChange} />
			<br></br>
		</label>
		<input type="submit" value="Gönder" />
		</form>
	</div>
	);
}

export default UserInput;
