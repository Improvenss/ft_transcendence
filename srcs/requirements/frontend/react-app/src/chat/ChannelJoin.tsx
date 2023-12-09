import { ChangeEvent, FormEvent, useRef } from 'react';
import './ChannelJoin.css';

function ChannelJoin({ onSuccess }: { onSuccess: (tabId: string) => void}){
	console.log("---------CHANNEL-JOIN----------");
	const joinChannelForm = useRef<HTMLFormElement>(null);

	const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {

	}

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();

	}

	return (
		<form ref={joinChannelForm} onSubmit={handleSubmit}>
			<label htmlFor="channel-name">Channel Name:</label>
			<input
				id="channel-name"
				placeholder="Enter channel name"
				type="text"
				name="name"
				onChange={handleInputChange}
				required
			/>
			<label htmlFor="channel-password">Channel Password:</label>
			<input
				id="channel-password"
				placeholder="Enter channel password"
				type="password"
				name="password"
				onChange={handleInputChange}
				required
			/>
			<button type="submit">Join Channel</button>
		</form>
	);
}

export default ChannelJoin;
