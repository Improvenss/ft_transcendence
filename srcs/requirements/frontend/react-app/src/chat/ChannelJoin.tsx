import { FormEvent } from 'react';
import { IChannelJoinForm } from './iChannel';
import './ChannelJoin.css';

function ChannelJoin({ onSuccess }: { onSuccess: (tabId: string) => void}){
	console.log("---------CHANNEL-JOIN----------");

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		const formElement = e.currentTarget as HTMLFormElement;
		const formObject: IChannelJoinForm = {
			name: (formElement.elements.namedItem('name') as HTMLInputElement).value,
			password: (formElement.elements.namedItem('password') as HTMLInputElement).value,
			type: 'private',
		};
		console.log(formObject.name);
		console.log(formObject.password);
		formElement.reset();
	}

	return (
		<form onSubmit={handleSubmit}>
			<label htmlFor="channel-name">Channel Name:</label>
			<input
				id="channel-name"
				placeholder="Enter channel name"
				type="text"
				name="name"
				required
			/>
			<label htmlFor="channel-password">Channel Password:</label>
			<input
				id="channel-password"
				placeholder="Enter channel password"
				type="password"
				name="password"
				required
			/>
			<button type="submit">Join Channel</button>
		</form>
	);
}

export default ChannelJoin;
