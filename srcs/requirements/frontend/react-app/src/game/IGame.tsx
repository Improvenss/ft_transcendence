// const	createGameObject = {
// 	name: roomName,
// 	mode: gameMode,
// 	winScore: winningScore,
// 	duration: gameDuration,
// 	description: "Game Room created from React client!",
// }

export interface IGame {
	name: string;
	mode: string;
	winScore: number;
	duration: number;
	description: string;
}

export interface IGameRoom {
	name: string,
	password: string | null,
	mode: string,
	winScore: number,
	duration: number,
	description: string,
}