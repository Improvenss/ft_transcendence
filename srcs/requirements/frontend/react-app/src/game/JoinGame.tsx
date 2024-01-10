import { useEffect, useRef, useState } from "react";
import "./JoinGame.css";
import { useSocket } from "../hooks/SocketHook";
import { IGame } from "./IGame";
import { useNavigate } from "react-router-dom";
import fetchRequest from "../utils/fetchRequest";

export interface IGameJoinForm {
	name: string,
	password: string,
	type: 'private' | 'public',
}

function JoinGame(){
	console.log("---------JOIN-GAME---------");
	const [searchTerm, setSearchTerm] = useState('');
	const socket = useSocket();
	const [rooms, setRooms] = useState<IGame[]>([]);
	const navigate = useNavigate();
	const password = useRef<HTMLInputElement>(null);
	const [showGamePassword, setShowGamePassword] = useState<IGame | null>(null);
	const [errorMessage, setErrorMessage] = useState('');

	useEffect(() => {
		const fetchRooms = async () => {
			const response = await fetchRequest({
				method: 'GET',
				url: "/game/room"
			});
			if (response.ok){
				const data = await response.json();
				console.log("Get Channels: ", data);
				if (!data.err){
					setRooms(data);
				} else {

				}
			} else {
				console.log("---Backend Connection '❌'---");
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
		/* eslint-disable react-hooks/exhaustive-deps */
	}, [socket]);

	const handleSubmit = async (game: IGame, password: string | null) => {
		const response = await fetchRequest({
			method: 'POST',
			body: JSON.stringify({
				room: game.name,
				password: password,
			}),
			url: `/game/room/register`
		});
		if (response.ok){
			const data = await response.json();
			console.log("Join-game: ", data);
			if (!data.err){
				navigate(`/game/lobby/${game.name}`, {replace: true});
				if (errorMessage != null)
					setErrorMessage('');
			} else {
				console.log("Join-game:", data.err);
				setErrorMessage(data.err);
			}
		} else {
			console.log("---Backend Connection '❌'---");
		}
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
							game.duration.toString().includes(searchTermLower) ||
							game.type.toLowerCase().includes(searchTermLower) 
						);
					})
					.map((game, index) => (
						<div
							key={index}
							id='games'
						>
							<div
								id="game"
								onClick={() => {
									if (game.type === 'private'){
										setShowGamePassword((prevGame) => (prevGame === game ? null : game))
									} else {
										handleSubmit(game, null);
									}
								}}
							>
								<span>{game.name}</span>
								<span>{game.mode}</span>
								<span>{game.winScore}</span>
								<span>{game.duration}</span>
								<span>{game.type}</span>
							</div>
							{(showGamePassword && showGamePassword.name === game.name) && (
								<div id="game-password">
									<input
										type="password"
										name="password"
										ref={password}
										placeholder="Enter password"
									/>
									{errorMessage && <p className="error-message">{errorMessage}</p>}
									<button
										type="submit"
										onClick={() => {
											const enteredPassword = password.current?.value;
											if (!enteredPassword || !enteredPassword.trim()) {
												setErrorMessage("Password is required.");
											} else {
												{errorMessage && setErrorMessage('')}
												handleSubmit(game, enteredPassword);
											}
										}}
									>
										Join
									</button>
								</div>
							)}
						</div>
					))}
			</div>
		</div>
	);
}

export default JoinGame;