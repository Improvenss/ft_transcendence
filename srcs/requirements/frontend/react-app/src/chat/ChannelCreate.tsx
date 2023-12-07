import { useState, ChangeEvent, FormEvent, useRef } from "react";
import './ChannelCreate.css';
import { IChannelFormData } from "./iChannel";
import Cookies from "js-cookie";

const defaultForm: IChannelFormData = {
	name: '',
	type: 'public',
	password: null,
	image: null,
	description: ''
}

function CreateChannelForm(){
	console.log("---------CHANNEL-CREATE-FORM---------");
	const userCookie = Cookies.get("user");
	const CreateChannelForm = useRef<HTMLFormElement>(null);
	const [channelData, setChannelData] = useState<IChannelFormData>(defaultForm);

	const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
		const { name, value } = e.currentTarget;
		const files = e.target instanceof HTMLInputElement && 'files' in e.target ? e.target.files : null;

//-------------------image kontrolü eklenebilir----------------------//

	// 	if (file) {
	// 		const maxSize = 5 * 1024 * 1024; // 5 MB
	// 		if (file.size > maxSize){
	// 			alert('Image size exceeds the limit (5 MB max). Please choose a smaller image.');	
	// 			event.target.value = '';
	// 			return ;
	// 		}

	// 		const allowedExtensions = /(\.jpg|\.jpeg|\.png|\.gif)$/i;
	// 		if (!allowedExtensions.exec(file.name)) {
	// 			alert('Invalid file type. Please choose a valid image file (jpg, jpeg, png, gif).');
	// 			event.target.value = '';
	// 			return ;
	// 		}
	//	}
//-------------------------------------------------------------------//

		if (name === 'image' && files && !files[0].type.startsWith('image/')){
			console.error('Lütfen bir resim dosyası seçin.');
		} else {
			setChannelData({
				...channelData,
				[name]: name === 'image' ? (files ? files[0] : null) : value,
			});
		}
	  };

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();

		console.log(channelData);

		const formData = new FormData();
		formData.append('name', channelData.name);
		formData.append('type', channelData.type);
		formData.append('password', channelData.password as string);
		formData.append('description', channelData.description);
		formData.append('image', channelData.image as File);

		try {
			const createChannelResponse = await fetch(process.env.REACT_APP_CHANNEL_CREATE as string, {
				method: 'POST',
				headers: {
					"Authorization": "Bearer " + userCookie,
				},
				body: formData,
			});
		
			if (!createChannelResponse.ok) {
				throw new Error('Kanal oluşturulurken bir hata oluştu.');
			}
			console.log('Kanal başarıyla oluşturuldu!');
		} catch (error) {
			console.error(error);
		}
		setChannelData(defaultForm);
		CreateChannelForm.current?.reset();
	  };

	return (
		<form ref={CreateChannelForm} onSubmit={handleSubmit}>
			<label>
				Channel Name:
				<input
					id="channel-name"
					placeholder="Enter channel name"
					type="text"
					name="name"
					onChange={handleInputChange}
					required
				/>
			</label>
			<label>
				Channel Type:
				<select
					id="channel-type"
					name="type"
					onChange={handleInputChange}
					required
				>
					<option value="public">Public</option>
					<option value="private">Private</option>
				</select>
			</label>
			{channelData.type === 'private' && (
				<label>
					Channel Password:
					<input
						id="channel-password"
						placeholder="Enter channel password"
						type="password"
						name="password"
						onChange={handleInputChange}
						required
					/>
				</label>
			)}
			<label>
				Channel Description:
				<input
					id="channel-description"
					type="text"
					name="description"
					onChange={handleInputChange}
				/>
			</label>
			<label>
				Channel Image:
				<input
					id="image-file"
					type="file"
					// accept="image/*"
					accept="image/jpg, image/jpeg, image/png, image/gif"
					name="image"
					onChange={handleInputChange}
					required
				/>
			</label>
			{channelData.image && (
				<img 
					src={URL.createObjectURL(channelData.image)}
					alt="Selected Channel Image"
					id="set-channel-image"
				/>
			)}
			<button type="submit">Create Channel</button>
		</form>
	);
}

export default CreateChannelForm;
