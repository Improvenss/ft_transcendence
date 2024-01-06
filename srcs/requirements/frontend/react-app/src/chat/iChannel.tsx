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

export interface IUserUpdateForm {
	nickname: string;
	image: File | null; //avatar
}

/* -------- yukarı ok --------- */




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

