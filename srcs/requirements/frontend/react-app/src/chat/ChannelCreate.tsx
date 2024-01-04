import { useState, ChangeEvent, FormEvent } from "react";
import { IChannelCreateForm } from "./iChannel";
import './ChannelCreate.css';
import { useChannelContext } from "./ChatPage";
import fetchRequest from "../utils/fetchRequest";
import { isValidImage } from "../utils/fileValidation";

const defaultForm: IChannelCreateForm = {
	name: '',
	type: 'public',
	password: null,
	image: null,
	description: ''
}

function ChannelCreate({ onSuccess }: { onSuccess: (tabId: string) => void }){
	console.log("---------CHANNEL-CREATE----------");
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const { setActiveChannel,  } = useChannelContext();
	const [channelData, setChannelData] = useState<IChannelCreateForm>(defaultForm);
	const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
		const { name, value } = e.currentTarget;
		const file = (e.target instanceof HTMLInputElement && e.target.files) ? e.target.files[0] : null;
	
		if (name === 'image' && file) {
			const validResult = isValidImage(file);
			if (validResult.status === false){
				e.target.value = ''; // Hatalı resim seçildiğinde dosyanın adını temizle
				setErrorMessage(validResult.err);
				setChannelData(prevData => ({ ...prevData, image: null }));
			} else {
				setChannelData(prevData => ({ ...prevData, image: file }));
				setErrorMessage(null);
			}
		} else {
			setChannelData(prevData => ({ ...prevData, [name]: value }));
		}
	};

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		const formElement = e.currentTarget as HTMLFormElement;

		console.log(channelData);

		const formData = new FormData();
		formData.append('name', channelData.name);
		formData.append('type', channelData.type);
		if (channelData.password != null)
			formData.append('password', channelData.password);
		formData.append('description', channelData.description);
		formData.append('image', channelData.image as File);

		const response = await fetchRequest({
			method: 'POST',
			body: formData,
			url: '/chat/channel/create',
		})
		if (response.ok){
			const data = await response.json();
			console.log("ChannelCreate:", data);
			if (!data.err){
				console.log("---Channel created '✅'---");
				setActiveChannel(data);
				onSuccess('involved');
			} else {
				console.log("ChannelCreate err:", data.err);
			}
		} else {
			console.log("---Backend Connection '❌'---");
		}
		setChannelData(defaultForm);
		formElement.reset();
	};

	return (
		<form onSubmit={handleSubmit}>
			{errorMessage && <p className="error-message">{errorMessage}</p>}
			<label htmlFor="channel-name">Channel Name: <span className="required">*</span></label>
			<input
				id="channel-name"
				placeholder="Enter channel name"
				type="text"
				name="name"
				onChange={handleInputChange}
				required
				autoComplete="off" //chrome uyarı verdiği için ekledim.
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
					alt={channelData.image.name}
					id="channel-image-output"
				/>
			)}
			<button type="submit">Create Channel</button>
		</form>
	);
}

export default ChannelCreate;
