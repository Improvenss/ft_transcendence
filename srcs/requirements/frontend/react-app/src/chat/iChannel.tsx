export interface IMessage {
	sender: string;
	content: string;
	timestamp: number;
}

// Backend DTO
export interface CreateChannelDto {
	status: 'public' | 'involved';
	name: string;
	type: 'public' | 'private' | 'protected';
	password?: string;
	image: string;
}

export interface IChannel {
	status: 'public' | 'involved';
	name: string;
	type: 'public' | 'involved';
	password?: string;
	image: string;
}

export interface IChannelFormData {
	name: string;
	type: 'public' | 'private';
	password: string | null;
	image: File | null;
	description: string;
}

export interface IChannelProps{
	// setSelectedChannel:  React.Dispatch<React.SetStateAction<IChannel | null>>;
	channels: IChannel[];
}

export interface IOnChannelProps {
	selectedChannel: IChannel | null;
	isInfoChannelActive: boolean;
	setIsInfoChannelActive: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface IFriend {
	name: string;
	status: 'online' | 'offline' | 'AFK';
	image: string;
}
