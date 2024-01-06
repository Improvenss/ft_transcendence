export interface IMessage {
	id: number;
	content: string;
	sentAt: number;
	author: IUser;
}

export interface IUser {
	login: string;
	imageUrl: string;
	nickname: string;
	avatar: string;
	status: string;
}

export interface IChannel {
	id: number,
	name: string,
	description: string,
	type: 'public' | 'private',
	image: string,
	members: IUser[],
	admins: IUser[],
	bannedUsers: IUser[],
	messages: IMessage[],
	status: 'involved' | 'public'//'not-involved',
}

export interface IChannelContext {
	channels: IChannel[] | undefined;
	setChannels: React.Dispatch<React.SetStateAction<IChannel[] | undefined>>;
	activeChannel: IChannel | null;
	setActiveChannel: React.Dispatch<React.SetStateAction<IChannel | null>>;
	channelInfo: boolean;
	setChannelInfo: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface IChannelCreateForm {
	name: string;
	type: 'public' | 'private';
	password: string | null;
	image: File | null;
	description: string;
}
