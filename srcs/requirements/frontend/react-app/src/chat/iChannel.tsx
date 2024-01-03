export interface IMessage {
	id: number;
	author: IUser;
	content: string;
	sentAt: number;
}

export interface IUser {
	login: string;
	imageUrl: string;
	nickname: string;
	avatar: string;
	status: string;
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
	bannedUsers: IUser[];
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

// Backend DTO
export interface CreateChannelDto {
	status: 'public' | 'involved';
	name: string;
	type: 'public' | 'private' | 'protected';
	password?: string;
	image: string;
}

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

