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

function ChannelCreate({ onSuccess }: { onSuccess: (tabId: string) => void }){
	console.log("---------CHANNEL-CREATE----------");
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

		if (name === 'image' && files && !files[0]?.type.startsWith('image/')){
			setChannelData((prevData) => ({
				...prevData,
				image: null,
			}));
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
			onSuccess('involved');
		} catch (error) {
			console.error(error);
		}
		setChannelData(defaultForm);
		CreateChannelForm.current?.reset();
	  };

	return (
		<form ref={CreateChannelForm} onSubmit={handleSubmit}>
			<label htmlFor="channel-name">Channel Name: <span className="required">*</span></label>
			<input
				id="channel-name"
				placeholder="Enter channel name"
				type="text"
				name="name"
				onChange={handleInputChange}
				required
			/>
			<label htmlFor="channel-type">Channel Type:</label>
			<select
				id="channel-type"
				name="type"
				onChange={handleInputChange}
				required
			>
				<option value="public">Public</option>
				<option value="private">Private</option>
			</select>
			{channelData.type === 'private' && (
				<>
					<label htmlFor="channel-password">Channel Password: <span className="required">*</span></label>
					<input
						id="channel-password"
						placeholder="Enter channel password"
						type="password"
						name="password"
						onChange={handleInputChange}
						required
					/>
				</>
			)}
			<label htmlFor="channel-description">Channel Description:</label>
			<input
				id="channel-description"
				placeholder="Enter channel description"
				type="text"
				name="description"
				onChange={handleInputChange}
			/>
			<label htmlFor="channel-image">Channel Image: <span className="required">*</span></label>
			<input
				id="channel-image"
				type="file"
				// accept="image/*"
				accept="image/jpg, image/jpeg, image/png, image/gif"
				name="image"
				onChange={handleInputChange}
				required
			/>
			{channelData.image && (
				<img 
					src={URL.createObjectURL(channelData.image)}
					alt="Selected Channel Image"
					id="channel-image-output"
				/>
			)}
			<button type="submit">Create Channel</button>
		</form>
	);
}

export default ChannelCreate;
