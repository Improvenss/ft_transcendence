import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useSocket } from '../hooks/SocketHook';
import { useAuth } from "../hooks/AuthHook";
import GameInput from "./GameInput";
import './GamePage.css';
// -----------------V
import { Socket } from 'socket.io-client';
// -----------------^
function GamePage()
{
	console.log("---------GAME-PAGE---------");
	const isAuth = useAuth().isAuth;
	const	channelList = ['hehe', 'gameRoom2', 'gameRoom3'];
	const	socket = useSocket();

	const	[commands, setCommands] = useState<string[]>([]);

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
		return () => {
			socket?.off("gameRoomCommandListener", commandListener);
		}
	}, [commandListener]);

	if (!isAuth) {
		return (<Navigate to='/login' replace />);
	}

	const gameController = () => {
		const playerBox =  document.getElementById("playerLeft");

		console.log("Game:-----------------> gameController");
		if (commands[commands.length - 1])
		{
			if (playerBox)
			{
				var moveSpeed = 10;
				// var plx = pL.offsetLeft;
				// var ply = pL.offsetTop;
				// console.log(" X: " + commands[commands.length - 1].substring(0, commands.length) + " Y: " + Number(commands[commands.length - 1].substring(0, commands.length - 1)));
				var plx = Number(commands[commands.length - 1].substring(0, commands.length - 1));
				var ply = Number(commands[commands.length - 1].substring(0, commands.length - 1));
				// ply += 1;
				// plx += 1;
				// if (plx && ply)
				// {
					// ply -= 1;
					// plx -= 1;
				console.log("Game accepted: " + commands[commands.length - 1] + " X: " + plx + " Y: " + ply);
				if (Number.isNaN(plx))
				{
					plx = playerBox.offsetLeft;
				}
				if (Number.isNaN(ply))
				{
					ply = playerBox.offsetTop;
				}
				switch (commands[commands.length - 1][commands[commands.length - 1].length -1])
				{
					case 'U':
						ply -= moveSpeed;
						playerBox.style.top = ply.toString() + "px";
						break;
					case 'D':
						ply += moveSpeed;
						playerBox.style.top = ply.toString() + "px";
						break;
					case 'L':
						plx -= moveSpeed;
						playerBox.style.left = plx.toString() + "px";
						break;
					case 'R':
						plx += moveSpeed;
						playerBox.style.left = plx.toString() + "px";
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
				<p className="LeftScore" id="leftScore">00</p>
				<p className="RightScore"id="rightScore">00</p>
				<div id="ball"><p>Am I a Ball?</p></div>
				<div className="PlayerLeft" id="playerLeft"></div>
				{/* <div className="Player" id="PlayerRight"></div> */}
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
				<p>G CMD: {commands}</p>
			</div>
		</div>
	)
}
export default GamePage;
