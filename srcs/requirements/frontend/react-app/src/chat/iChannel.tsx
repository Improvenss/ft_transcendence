export interface IMessage {
	sender: string;
	content: string;
	timestamp: number;
}

export interface IUser {
	login: string;
	imageUrl: string;
	nickname: string;
	avatar: string;
}

export interface IChannel {
	status: 'public' | 'involved';
	name: string;
	description: string;
	type: 'public' | 'involved';
	password?: string;
	image: string;
	members: IUser[];
	admins: IUser[];
	messages: IMessage[];
}

export interface IChannelCreateForm {
	name: string;
	type: 'public' | 'private';
	password: string | null;
	image: File | null;
	description: string;
}

export interface IChannelJoinForm {
	name: string,
	password: string,
	type: 'private',
}

export interface IChannelContext {
	channels: IChannel[] | undefined;
	activeChannel: IChannel | null;
	setActiveChannel: React.Dispatch<React.SetStateAction<IChannel | null>>;
	channelInfo: boolean;
	setChannelInfo: React.Dispatch<React.SetStateAction<boolean>>;
}

// Backend DTO
export interface CreateChannelDto {
	status: 'public' | 'involved';
	name: string;
	type: 'public' | 'private' | 'protected';
	password?: string;
	image: string;
}

// export interface IChannelProps{
// 	// setActiveChannel:  React.Dispatch<React.SetStateAction<IChannel | null>>;
// 	channelsData: {
// 		channels: IChannel[];
// 		activeChannel: IChannel;
// 	}
// }

export interface IOnChannelProps {
	activeChannel: IChannel | null;
	isInfoChannelActive: boolean;
	setIsInfoChannelActive: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface IFriend {
	name: string;
	status: 'online' | 'offline' | 'AFK';
	image: string;
}

