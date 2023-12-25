import { FormEvent, useEffect, useState } from "react";
import "./JoinGame.css";
import Cookies from "js-cookie";
import { useSocket } from "../hooks/SocketHook";
import { IGame } from "./IGame";
import { useNavigate } from "react-router-dom";

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
	const navigate = useNavigate();

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
		const response = await fetch(process.env.REACT_APP_FETCH + `/game/room/register`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				"Authorization": "Bearer " + userCookie,
			},
			body: JSON.stringify({
				room: formObject.name,
				password: formObject.password ? formObject.password : null,
			}),
		});
		if (!response.ok)
			throw (new Error("API fetch error."));
		const data = await response.json();
		console.log("Join-game: ", data);

		navigate(`/game/lobby/${formObject.name}`);

		formElement.reset();
	}

	return(
		<div id="join-game">
			<h3>Join Public - Private Game</h3>
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
					<span>Game Type</span>
				</div>
				{rooms
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
								<span>{game.type}</span>
								<input type="hidden" name="name" value={game.name} />
								<input type="hidden" name="password" value="" />
								<input type="hidden" name="type" value={game.type} />
							</button>
						</form>
					))}
			</div>
		</div>
	);
}

export default JoinGame;