export interface IMessage {
	sender: string;
	content: string;
	timestamp: number;
}

export interface IChannel {
	status: 'public' | 'involved';
	name: string;
	type: 'public' | 'involved';
	password?: string;
	image: string;
	users: {name: string, image: string}[];
	chat: IMessage[];
}

export interface IChannelFormData {
	name: string;
	type: string;
	password: string;
	image: string;
}

export interface IChannelProps{
	setSelectedChannel:  React.Dispatch<React.SetStateAction<IChannel | null>>;
	channels: IChannel[];
}

export interface IOnChannelProps {
	selectedChannel: IChannel | null;
}

export interface IFriend {
	name: string;
	status: 'online' | 'offline' | 'AFK';
	image: string;
}