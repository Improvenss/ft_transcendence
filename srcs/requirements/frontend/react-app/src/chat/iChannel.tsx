export interface IMessage {
	id: number,
	content: string,
	sentAt: number,
	author: IUser,
}

export interface IUser {
	id: number,
	login: string,
	imageUrl: string,
	nickname: string,
	avatar: string,
	status: string,
}

export interface INotif {
	id: number,
	type: 'text' | 'sendFriendRequest' | 'acceptFriendRequest' | 'declineFriendRequest',
	// type: string,
	text: string,
	date: string,
	// date: Date,
	read: boolean,
	from: string,
}

export interface IUserProps{
	id: number,
	email: string,
	login: string,
	displayname: string,
	imageUrl: string,
	socketId: string,
	status: string,
	nickname?: string,
	avatar?: string,
	friends: IUserProps[],
	notifications: INotif[],
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
	dms: IDms[] | undefined,
	setDms: React.Dispatch<React.SetStateAction<IDms[] | undefined>>,
	activeDm: IDms | null,
	setActiveDm: React.Dispatch<React.SetStateAction<IDms | null>>,
	channels: IChannel[] | undefined,
	setChannels: React.Dispatch<React.SetStateAction<IChannel[] | undefined>>,
	activeChannel: IChannel | null,
	setActiveChannel: React.Dispatch<React.SetStateAction<IChannel | null>>,
	channelInfo: boolean,
	setChannelInfo: React.Dispatch<React.SetStateAction<boolean>>,
}

export interface IChannelCreateForm {
	name: string,
	type: 'public' | 'private',
	password: string | null,
	image: File | null,
	description: string,
}

export interface IDms {
	id: number,
	name: string,
	displayname: string,
	image: string,
	members: IUser[],
	messages: IMessage[], //kesin değil, kontrol et
}