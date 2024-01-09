import { FormEvent, useState } from 'react';
import './ChannelJoin.css';

function ChannelJoin({ handleChannelAction}: { 
		handleChannelAction:  (channelName: string, password: string) => Promise<void>
	}){
		console.log("---------CHANNEL-JOIN----------");
		const [errorMessage, setErrorMessage] = useState<string | null>(null);

		const handleSubmit = async (e: FormEvent) => {
			e.preventDefault();
			const formElement = e.currentTarget as HTMLFormElement;
			const name = (formElement.elements.namedItem('name') as HTMLInputElement).value
			const password = (formElement.elements.namedItem('password') as HTMLInputElement).value
			console.log(`Channel Join: name:[${name}] password:[${password}]`);
			if (password != null && (/\s/.test(password))){
				setErrorMessage('Your password must not contain any space characters.');
				return;
			}
			if (errorMessage)
				setErrorMessage(null)
			handleChannelAction(name, password);
			formElement.reset();
		}

	return (
		<form onSubmit={handleSubmit}>
			{errorMessage && <p className="error-message">{errorMessage}</p>}
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
