import { useRef, useState } from 'react';
import { ReactComponent as IconCreate } from '../assets/chat/iconCreate.svg';
import { ReactComponent as IconPublic } from '../assets/chat/iconPublic.svg';
import { ReactComponent as IconInvolved } from '../assets/chat/iconInvolved.svg';
import './Channel.css';
import { IChannelProps, IChannelFormData, IChannel, IMessage } from './iChannel';

function Channel({ setSelectedChannel, channels }: IChannelProps) {
	const [activeTab, setActiveTab] = useState('involved');
	const [showPassword, setShowPassword] = useState(false);
	const CreateChannelForm = useRef<HTMLFormElement>(null);
	const [selectedImage, setSelectedImage] = useState<string | null>(null);
	const [searchTerm, setSearchTerm] = useState('');

	const handleTabClick = (tabId: string) => {
		if (tabId !== 'create') {
			setShowPassword(false);
		}
		setActiveTab(tabId);
		// Implement logic to update content based on the selected tab
		// For now, let's just log a message to the console
		console.log(`Switched to ${tabId} channel`);
	};

	const createChannel = (event: React.FormEvent) => {
		event.preventDefault(); // Formun otomatik submit işlemini engelle
		// Implement your channel creation logic here
		// For now, let's just log a message to the console
		const formData = new FormData(CreateChannelForm.current as HTMLFormElement);
		const channelData: IChannelFormData = {
			name: formData.get('name') as string,
			type: formData.get('type') as string,
			password: formData.get('password') as string || '',
			image: formData.get('image') as string,
		};
		console.log(channelData);
		console.log('Channel created');
		CreateChannelForm.current?.reset();
		setSelectedImage(null);
		if (channelData.type === 'involved')
			setShowPassword(false);
	};

	const handleChannelTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		console.log('Selected Channel Type:', e.target.value);
		setShowPassword(e.target.value === 'involved');
	};

	const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			const maxSize = 5 * 1024 * 1024; // 5 MB
			if (file.size > maxSize){
				alert('Image size exceeds the limit (5 MB max). Please choose a smaller image.');	
				event.target.value = '';
				return ;
			}

			const allowedExtensions = /(\.jpg|\.jpeg|\.png|\.gif)$/i;
			if (!allowedExtensions.exec(file.name)) {
				alert('Invalid file type. Please choose a valid image file (jpg, jpeg, png, gif).');
				event.target.value = '';
				return ;
			}

			const reader = new FileReader();
			reader.onloadend = () => {
				// Dosya okunduğunda, veri URL'sini selectedImage'e atar
				setSelectedImage(reader.result as string);
			};
			reader.readAsDataURL(file);
		}
	};

	const handleChannelClick = (channel: IChannel) => {
			setSelectedChannel(channel);
	};

	return (
		<div id="channel">
			<div id="container">
				<div className={`channel ${activeTab === 'create' ? 'active' : ''} tab`} onClick={() => handleTabClick('create')}>
					<IconCreate />
				</div>
				<div className={`channel ${activeTab === 'public' ? 'active' : ''} tab`} onClick={() => handleTabClick('public')}>
					<IconPublic />
				</div>
				<div className={`channel ${activeTab === 'involved' ? 'active' : ''} tab`} onClick={() => handleTabClick('involved')}>
					<IconInvolved />
				</div>
			</div>
			<div id="container-content">
					<div className="content-header">
						{activeTab === 'create' && <h1>Create a Channel</h1>}
						{activeTab === 'public' && <h1>Public Channels</h1>}
						{activeTab === 'involved' && <h1>Involved Rooms</h1>}
					</div>
					{activeTab === 'create' && (
						<form ref={CreateChannelForm} onSubmit={createChannel}>
						<div className="form">

							<label htmlFor="channel-name">Channel Name:</label>
							<input
								type="text"
								id="channel-name"
								placeholder="Enter channel name"
								name="name"
								required
							/>

							<label htmlFor="channelType">Channel Type:</label>
							<select id="channel-type" name="type" onChange={handleChannelTypeChange} required>
								<option value="public">Public</option>
								<option value="involved">involved</option>
							</select>

							{showPassword && (
								<>
									<label htmlFor="channel-password">Channel Password:</label>
									<input
										type="password"
										id="channel-password"
										placeholder="Enter channel password"
										name="password"
										required
									/>
								</>
							)}

							<label htmlFor="channel-image">Channel Image:</label>
							<input
								type="file"
								id="image-file"
								name="image"
								onChange={handleImageChange}
								accept=".jpg, .jpeg, .png, .gif" // Belirli uzantıları kabul etme
								required
							/>
							{selectedImage && (
								<img
									src={selectedImage}
									alt="Selected Channel Image"
									id="set-channel-image"
								/>
							)}

							<button type="submit">Create Channel</button>
						</div>
						</form>
					)}

					{(activeTab === 'public' || activeTab === 'involved') && (
						<div>
						<input
							id="channel-search"
							type="text"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							placeholder="Search channels..."
						/>
						{channels
							.filter((channel) => channel.status === activeTab && channel.name.toLowerCase().includes(searchTerm.toLowerCase()))
							.map((channel) => (
								<div
									key={channel.name}
									id={activeTab === 'public' ? 'public-channel' : 'involved-channel'}
									onClick={() => handleChannelClick(channel)} // Tıklama olayı
								>
									<img src={channel.image} alt={channel.image} />
									<span>{channel.name}</span>
								</div>
						))}
						</div>
					)}
				</div>
		</div>
	);
}

export default Channel;
