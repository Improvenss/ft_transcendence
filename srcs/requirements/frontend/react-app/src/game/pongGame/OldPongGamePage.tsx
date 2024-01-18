import React, { useState, useEffect, useRef } from "react";
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { Navigate } from "react-router-dom";
import { useSocket } from "../../hooks/SocketHook";
import {useUser} from "../../hooks/UserHook";
import { IUser } from '../../chat/iChannel';
import fetchRequest from '../../utils/fetchRequest';
import "./styles.css";
import { createModuleResolutionCache } from "typescript";

//odaya ilk gelen admin, server admine göre oynar(admin solda), herkes kendini solda görür ama değerler admin olana göre aynalanır(ball x-y, score)

function OldPongGamePage() {
	
	const delay = 25;

	const playerHeight = 120;
	const ballRadius = 21;
	var intervalID;
	
	//Game area
	const AreaHeight = 800;
	const AreaWidth = 1000;

	const location = useLocation();
	const {socket} = useSocket();
	const user = useUser();
	const nagivate = useNavigate();
	const [commands, setCommands] = useState<string[]>([]);
	const [ballPos, setBallPos] = useState<{x: number, y: number} | undefined>(undefined);
	const roomName = location.pathname.split('/')[2];
	const [playerLeftPosition, setPlayerLeftPosition] = useState(0);
	const [playerRightPosition, setPlayerRightPosition] = useState(0);
	// const [leftScore, setLeftScore] = useState(0);
	// const [rightScore, setRightScore] = useState(0);
	const [leftScore, setLeftScore] = useState(0);
	const [rightScore, setRightScore] = useState(0);
	// const [intervalId, setIntervalId] = useState(null);
	var	playerLeftName = useRef<HTMLDivElement>(null);
	var	playerRightName = useRef<HTMLDivElement>(null);
	var	playerLeftBox = useRef<HTMLDivElement>(null);
	var	playerRightBox= useRef<HTMLDivElement>(null);
	var	leftScoreRef= useRef<HTMLDivElement>(null);
	var	rightScoreRef= useRef<HTMLDivElement>(null);

	const handleDisconnect = () => {
		console.log("Socket disconnected");
		console.log("Leaving");
		return <Navigate to="/home" replace />;
	};

	const commandListener = (command: string) => {
		setCommands((prevCommand) => [...prevCommand, command]);
	};


	useEffect(() => {//--------------------------------------------------START
		if (playerLeftName.current && user.userInfo)
					playerLeftName.current.textContent = user.userInfo.login;
		if (playerLeftBox.current)
			playerLeftBox.current.style.top = ((AreaHeight / 2) - (playerHeight / 2)) + "px";
		if (playerRightBox.current)
			playerRightBox.current.style.top = ((AreaHeight / 2) - (playerHeight / 2)) + "px";
		setLeftScore(0);
		setRightScore(0);
		socket.emit('startGame', {login: user.userInfo?.login, roomName: roomName});
	}, []);

	useEffect(() => {
		socket.on("gameRoomCommandListener", commandListener);
		socket.on("disconnect", handleDisconnect);

		return () => {
			socket.off("gameRoomCommandListener", commandListener);
			socket.off("disconnect", handleDisconnect);
		};
		
	}, [commandListener, handleDisconnect]);

	useEffect(() => {//--------------------------------------------------ALL

		window.addEventListener("keydown", (e) => {//********KEY-DOWN
			socket?.emit('keydown', {
				roomName: roomName,
				login: user.userInfo?.login,
				key: e.key,
			});
			// console.log(playerRightBox.current?.offsetLeft);
		});

		window.addEventListener("keyup", (e) => {//********KEY-UP
			// console.log(e.key);
		});

		socket?.on('movePlayer', (gameData) => {//********MOVE-BY-SERVER

			if (gameData.login === user.userInfo?.login)
				setPlayerLeftPosition(gameData.newPos);
			else
			{
				if (playerRightName.current)
					playerRightName.current.textContent = gameData.login;
				setPlayerRightPosition(gameData.newPos);
			}
		});
		socket?.on('updateScore', (gameData) => {//********UPDATE-SCORE
			// console.log("update Score:" + gameData.leftScore + " " + gameData.rightScore + " " + gameData.login);
			if (gameData.login === user.userInfo?.login)
			{
				setLeftScore(gameData.leftScore);
				setRightScore(gameData.rightScore);
			}
			else
			{
				setLeftScore(gameData.rightScore);
				setRightScore(gameData.leftScore);
			}
		});

		socket?.on('startLoop', (data) => {//********START-BALL-LOOP
			console.log("loop starting");
			setBallPos({
				x:data.x,
				y:data.y
			});
			intervalID = setInterval(() => {
				ballMover();
			}, delay);
		});

		const ballMover = () =>{//********SEND-BALL-MOVE
			const data = {roomName:roomName, login: user.userInfo?.login, ballx: ballPos?.x, bally: ballPos?.y};
			socket?.emit('ballMover', data);
		}

		socket?.on('moveBall', (data) => {//********MOVE-BALL-BY-SERVER
			if (data.x && data.y)
			{
				var newX = 0;
				if (data.dir == user.userInfo?.login)
					newX = data.x;
				else
					newX = AreaWidth - data.x - ballRadius;//top aynalandı
				setBallPos({
					x:newX,
					y:data.y
				});
			}
		});

		return () => {};
	}, [socket]);

	const LeaveRoom = () => {
		console.log("leaving . . ." + socket?.id);
		socket?.emit('leaveGameRoom', {name: location.pathname.split('/')[2]});
		nagivate("/");
	};

	return (
		<div>
			<button onClick={LeaveRoom}>leaveGameRoom</button>
			<div className="Pong">
				<div className="container">
					<div className="gameField">
						<p className="PlayerName" ref={playerLeftName} style={{}} id="leftPlayerName">Left Player</p>
						<p className="PlayerName" ref={playerRightName} style={{margin:'0 0 0 auto'}} id="rightPlayerName">Right Player</p>
						<div className="ball" style={{top: ballPos?.y, left: ballPos?.x}}/>
						<div className="player1" id="player1" ref={playerLeftBox} style={{top: playerLeftPosition + 'px',}} />
						<div className="player2" id="player2" ref={playerRightBox}style={{top: playerRightPosition + 'px',}} />
						<div className="left-score" ref={leftScoreRef} style={{}}>{leftScore}</div>
						<div className="right-score" ref={rightScoreRef} style={{}}>{rightScore}</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default OldPongGamePage;