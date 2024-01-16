export interface IGame {
	name: string;
	mode: string;
	// mode: number;
	winScore: number;
	duration: number;
	description: string;
	type: 'public' | 'private',
}

export interface IGameRoom {
	name: string,
	password: string | null,
	mode: string,
	// mode: number,
	winScore: number,
	duration: number,
	description: string,
	type: 'public' | 'private',
}