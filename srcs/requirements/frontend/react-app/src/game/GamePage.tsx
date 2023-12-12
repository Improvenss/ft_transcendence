import { useEffect, useState, useRef } from "react";
import { Navigate } from "react-router-dom";
import { useSocket } from '../hooks/SocketHook';
import { useAuth } from "../hooks/AuthHook";
import GameInput from "./GameInput";
import RealBall from "./BallMechanic";
import {useUser} from "../hooks/UserHook";
import './GamePage.css';
// -----------------V
import { Socket } from 'socket.io-client';
// -----------------^
function GamePage()
{
	// console.log("---------GAME-PAGE---------");
	const isAuth = useAuth().isAuth;
	const	channelList = ['hehe', 'gameRoom2', 'gameRoom3'];
	const	socket = useSocket();
	const playerLeft = useRef<HTMLDivElement>(null);
	const playerRight = useRef<HTMLDivElement>(null);
	var	playerLeftName = useRef<HTMLDivElement>(null);
	var	playerRightName = useRef<HTMLDivElement>(null);
	const	[commands, setCommands] = useState<string[]>([]);
	const userInfo = useUser();

	const	commandListener = (command: string) => {
		setCommands(prevCommand => [...prevCommand, command]);
	}

	const	listenJoinGameRoom = (gameRoom: string, socket: Socket | undefined) => {
		if (socket === null)
			throw (new Error("Error: Socket: null"));
		const	roomData = {
			name: gameRoom,
		};
		socket?.emit("joinGameRoom", roomData);
		localStorage.setItem("onGameRoom", gameRoom);
	}

	const	leaveChannel = (gameRoom: string, socket: Socket | undefined) => {
		if (socket === null)
			throw (new Error("Error: Socket: null"));
		const roomData = {
			name: gameRoom,
		};
		socket?.emit("leaveGameRoom", roomData);
		// localStorage.setItem("onGameRoom", "none");
		localStorage.removeItem("onGameRoom");
	}

	useEffect(() => {
		socket?.on("gameRoomCommandListener", commandListener);
		socket?.on("disconnect", handleDisconnect);
		return () => {
			socket?.off("gameRoomCommandListener", commandListener);
		}
	}, [commandListener]);

	if (!isAuth) {
		return (<Navigate to='/login' replace />);
	}

	const handleDisconnect = () => {
		console.log("Socket disconnected");
		return (<Navigate to='/home' replace />);
	};

	const gameController = () => {
		// const playerLeft =  document.getElementById("playerLeft");
		if (commands[commands.length - 1] && userInfo)
		{
			const	getName = commands[commands.length - 1].match(/\d+(.*)/);
			if (playerLeft.current && getName && getName[1].substring(1, getName[1].length) == "uercan")
			{
				if (playerLeftName.current && getName)
					playerLeftName.current.textContent = getName[1].substring(1, getName[1].length);
				const newCoor = parseInt(commands[commands.length - 1].substring(0, commands.length - 1), 10);
				console.log("Game accepted: {" + getName[1].substring(1, getName[1].length) + "} newCoor: {"
				+ newCoor + "} DIR: {"
				+ commands[commands.length - 1][newCoor.toString().length] + "}"
				+ "user {" + commands[commands.length - 1].substring(newCoor.toString().length + 1, commands[commands.length - 1].length) + "}");
				switch (commands[commands.length - 1][newCoor.toString().length])
				{
					case 'U':
						playerLeft.current.style.top = newCoor.toString() + "px";
						break;
					case 'D':
						playerLeft.current.style.top = newCoor.toString() + "px";
						break;
					case 'L':
						playerLeft.current.style.left = newCoor.toString() + "px";
						break;
					case 'R':
						playerLeft.current.style.left = newCoor.toString() + "px";
						break;
					default:
						break;
				}
			}
			else if (playerRight.current)
			{
				if (playerRightName.current && getName)
					playerRightName.current.textContent = getName[1].substring(1, getName[1].length);
				const newCoor = parseInt(commands[commands.length - 1].substring(0, commands.length - 1), 10);
				// console.log("Game accepted: {" + commands[commands.length - 1] + "} newCoor: {" + newCoor + "} DIR: {" + commands[commands.length - 1][commands[commands.length - 1].length -1] + "}");
				switch (commands[commands.length - 1][newCoor.toString().length])
				{
					case 'U':
						playerRight.current.style.top = newCoor.toString() + "px";
						break;
					case 'D':
						playerRight.current.style.top = newCoor.toString() + "px";
						break;
					case 'L':
						playerRight.current.style.left = newCoor.toString() + "px";
						break;
					case 'R':
						playerRight.current.style.left = newCoor.toString() + "px";
						break;
					default:
						break;
				}
			}
			else
				console.log("Game: Player is not finded");
		}
		else
			console.log("Game: Empty input");
		};
	gameController();
	return (
		<div>
			<div className="gameArea">
				<p className="PlayerName" ref={playerLeftName} style={{}} id="leftPlayerName"></p>
				<p className="PlayerName" ref={playerRightName} style={{margin:'0 0 0 auto'}} id="rightPlayerName">Right Player</p>
				<p className="LeftScore" id="leftScore">00</p>
				<p className="RightScore"id="rightScore">00</p>
				<div className="PlayerLeft" id="playerLeft" ref={playerLeft}></div>
				<div className="PlayerRight" id="playerRight" ref={playerRight}></div>
				<RealBall></RealBall>
			</div>
			<div>
				<ul>
					{channelList.map(gameRoom => (
						<li key={gameRoom}
						onClick={
							() => listenJoinGameRoom(gameRoom, socket)
						}>{gameRoom}<button onClick={(e) => { e.stopPropagation(); leaveChannel(gameRoom, socket); }}>Leave</button> </li>
					))}
				</ul>
				<GameInput />
				{/* <GameInput getPos={getPos} /> */}
				{/* <p>G CMD: {commands}</p> */}
			</div>
		</div>
	)
}
export default GamePage;
