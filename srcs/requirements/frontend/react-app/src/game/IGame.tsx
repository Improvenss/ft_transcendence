export interface IGame {
	name: string;
	mode: string;
	winScore: number;
	duration: number;
	description: string;
	type: 'public' | 'private',
}

export interface IGameRoom {
	name: string,
	password: string | null,
	mode: string,
	winScore: number,
	duration: number,
	description: string,
	type: 'public' | 'private',
}