import { FormEvent, useEffect, useState } from "react";
import "./JoinGame.css";
import Cookies from "js-cookie";
import { useSocket } from "../hooks/SocketHook";
import { IGame } from "./IGame";

export interface IGameJoinForm {
	name: string,
	password: string,
	type: 'private' | 'public',
}

function JoinGame(){
	console.log("---------JOIN-GAME---------");
	const [searchTerm, setSearchTerm] = useState('');
	const socket = useSocket();
	const userCookie = Cookies.get("user");
	const [rooms, setRooms] = useState<IGame[]>([]);

	useEffect(() => {
		const fetchRooms = async () => {
			try {
				const response = await fetch(
					process.env.REACT_APP_FETCH + "/game/room", {
						method: 'GET',
						headers: {
							'Content-Type': 'application/json',
							"Authorization": "Bearer " + userCookie,
						},
					});
				if (!response.ok)
					throw new Error('API-den veri alınamadı.');
				const data = await response.json();
				console.log("Get Channels: ", data);
				setRooms(data);
			} catch (error) {
				console.error('Veri getirme hatası:', error);
			}
		};
	
		fetchRooms();

		const	roomListener = (room: IGame) => {
			console.log("Game'nin Room listesi guncelleniyor cunku degisiklik oldu.");
			fetchRooms();
		}
		socket?.on("roomListener", roomListener);
		return () => {
			socket?.off("roomListener", roomListener);
		}
	}, []);

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
					{rooms
					// .filter(game => game.name.toLowerCase().includes(searchTerm.toLowerCase()))
					.filter((game) => {
						const searchTermLower = searchTerm.toLowerCase();
						return (
						  game.name.toLowerCase().includes(searchTermLower) ||
						  game.mode.toLowerCase().includes(searchTermLower) ||
						  game.winScore.toString().includes(searchTermLower) ||
						  game.duration.toString().includes(searchTermLower)
						);
					  })
					.map((game, index) => (
						<form key={index} onSubmit={handleSubmit}>
							<button key={index} className="table-row">
								<span>{game.name}</span>
								<span>{game.mode}</span>
								<span>{game.winScore}</span>
								<span>{game.duration}</span>
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