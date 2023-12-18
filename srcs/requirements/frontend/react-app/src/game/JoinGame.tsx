import { FormEvent, useState } from "react";
import "./JoinGame.css";

export interface IGameJoinForm {
	name: string,
	password: string,
	type: 'private' | 'public',
}

interface IGame {
	name: string;
	mode: string;
	winningScore: number;
	gameDuration: string;
  }

function JoinGame(){
	console.log("---------JOIN-GAME---------");
	const [searchTerm, setSearchTerm] = useState('');
	const [publicGames, setPublicGames] = useState<IGame[]>([
		{
		  name: "Game-1",
		  mode: "Classic",
		  winningScore: 10,
		  gameDuration: "30 minutes",
		},
		{
		  name: "Game-2",
		  mode: "Team Battle",
		  winningScore: 15,
		  gameDuration: "45 minutes",
		},
		{
			name: "Game-3",
			mode: "Team Battle",
			winningScore: 115,
			gameDuration: "415 minutes",
		},
		{
			name: "Game-4",
			mode: "Team Battle",
			winningScore: 35,
			gameDuration: "15 minutes",
		},
		{
			name: "Game-5",
			mode: "Team Battle",
			winningScore: 5,
			gameDuration: "3 minutes",
		},
		{
			name: "Game-6",
			mode: "Team Battle",
			winningScore: 51,
			gameDuration: "39 minutes",
		},
		{
			name: "Game-6",
			mode: "Team Battle",
			winningScore: 25,
			gameDuration: "23 minutes",
		},
		{
			name: "Game-7",
			mode: "Team Battle",
			winningScore: 25,
			gameDuration: "31 minutes",
		},
	]);

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		const formElement = e.currentTarget as HTMLFormElement;
		const formObject: IGameJoinForm = {
			name: (formElement.elements.namedItem('name') as HTMLInputElement).value,
			password: (formElement.elements.namedItem('password') as HTMLInputElement).value,
			type: (formElement.elements.namedItem('type') as HTMLInputElement).value as 'private' | 'public',
		};
		console.log(formObject.name);
		console.log(formObject.password ? formObject.password : "null");
		console.log(formObject.type);
		formElement.reset();
	}

	return(
		<div id="join-game">
			<form id="private-game" onSubmit={handleSubmit}>
				<h3>Join Private Game</h3>
				<label htmlFor="room-name">Room Name:</label>
				<input
					placeholder="Enter name"
					type="text"
					name="name"
					required
				/>
				<label htmlFor="room-password">Room Password:</label>
				<input
					placeholder="Enter password"
					type="password"
					name="password"
					required
				/>
				<input type="hidden" name="type" value="private" />
				<button type="submit">Join Game</button>
     		</form>
			<div id="public-game">
				<h3>Join Public Game</h3>
				<input
					id="room-search"
					type="text"
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					placeholder="Search rooms..."
				/>
				<div id="rooms" className="table">
					<div className="header-row">
						<span>Room Name</span>
						<span>Mode</span>
						<span>Winning Score</span>
						<span>Game Duration</span>
					</div>
					{publicGames
					// .filter(game => game.name.toLowerCase().includes(searchTerm.toLowerCase()))
					.filter((game) => {
						const searchTermLower = searchTerm.toLowerCase();
						return (
						  game.name.toLowerCase().includes(searchTermLower) ||
						  game.mode.toLowerCase().includes(searchTermLower) ||
						  game.winningScore.toString().includes(searchTermLower) ||
						  game.gameDuration.toLowerCase().includes(searchTermLower)
						);
					  })
					.map((game, index) => (
						<form key={index} onSubmit={handleSubmit}>
							<button key={index} className="table-row">
								<span>{game.name}</span>
								<span>{game.mode}</span>
								<span>{game.winningScore}</span>
								<span>{game.gameDuration}</span>
								<input type="hidden" name="name" value={game.name} />
								<input type="hidden" name="password" value="" />
								<input type="hidden" name="type" value="public" />
							</button>
						</form>
					))}
				</div>
			</div>
		</div>
	);
}

export default JoinGame;