import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import fetchRequest from "../../utils/fetchRequest";
import { useSocket } from "../../hooks/SocketHook";
import { ILobby } from "../GameLobby";
import LoadingPage from "../../utils/LoadingPage";
import "./PongGamePage.css";

function PongGamePage() {
	//------------Example-----------------
	const exampleLiveRoom: ILobby = {
		id: 1,
		name: 'Sample Room',
		description: 'This is a sample lobby.',
		type: 'public',
		mode: 'classic',
		winScore: 5,
		duration: 180,
		players: [
		// ... uygun IUser nesneleri ekleyin
		],
		playerL: {
		user: {
			id: 1,
			login: 'sampleUser',
			socketId: 'sampleSocketId',
		},
		location: 400,
		ready: true,
		score: 0,
		speed: 0,
		},
		playerR: {
		user: {
			id: 2,
			login: 'anotherUser',
			socketId: 'anotherSocketId',
		},
		location: 400,
		ready: false,
		score: 0,
		speed: 0,
		},
		ball: {
		x: 500,
		y: 400,
		speedX: 3,
		speedY: 4,
		},
		running: false,
	};

	const [liveRoom, setLiveRoom] = useState<ILobby>(exampleLiveRoom);
	//----------------------------------------------------------------------

	const { roomName } = useParams();
	const navigate = useNavigate();
	//const [liveRoom, setLiveRoom] = useState<ILobby>();
	const { socket } = useSocket();
	const [result, setResult] = useState<string | undefined>(undefined);

	//useEffect(() => {
	//	const	gameListener = async () => {
	//		const response = await fetchRequest({
	//			method: 'GET',
	//			url: `/game/room/${roomName}/false` // lobby'e attik cunku orada aliyoruz zaten bu verileri.
	//		})
	//		if (response.ok){
	//			const data = await response.json();
	//			console.log("PongGamePage:", data);
	//			if (!data.err){
	//				setLiveRoom(data);
	//				socket.emit('joinGameRoom', {
	//					gameRoom: roomName,
	//				});
	//			} else {
	//				navigate('/404', {replace: true});
	//			}
	//		} else {
	//			console.log("---Backend Connection '❌'---");
	//		}
	//	}
	//	gameListener();
	//	/* eslint-disable react-hooks/exhaustive-deps */
	//}, [])

	useEffect(() => {
		const	handleLiveData = ({action}: {action: ILobby}) => {
			if (!action)
				return ;
			setLiveRoom(prevLiveRoom => ({...prevLiveRoom, ...action}));
		}
		const	finishGameData = ({ result }: { result: string }) => {
			let countdown = 8;
			const countdownInterval = setInterval(() => {
				setResult(`${result} | Redirecting in ${countdown} seconds...`);
				countdown--;
				if (countdown < 0) {
					clearInterval(countdownInterval);
					if (window.location.pathname === `/game/${roomName}`)
						navigate('/game', { replace: true });
				}
			}, 1000);
		}
		socket.on('updateGameData', handleLiveData);
		socket.on('finishGameData', finishGameData);
		return () => {
			socket.off('updateGameData', handleLiveData);
			socket.off('finishGameData', finishGameData);
		}
	}, [socket])

	// key press
	useEffect(() => {
		let	isUpPressed: boolean = false;
		let	isDownPressed: boolean = false;
		const handleKeyDown = (event: KeyboardEvent) => {
			if (!isUpPressed && (event.key === 'w' || event.key === 'ArrowUp')) {
				socket.emit('commandGameRoom', {
					gameRoom: roomName,
					way: 'UP',
					isKeyPress: true
				})
				isUpPressed = true;
			} else if (!isDownPressed && (event.key === 's' || event.key === 'ArrowDown')) {
				socket.emit('commandGameRoom', {
					gameRoom: roomName,
					way: 'DOWN',
					isKeyPress: true
				})
				isDownPressed = true;
			}
		};
		const handleKeyUp = (event: KeyboardEvent) => {
			if (event.key === 'w' || event.key === 'ArrowUp') {
				socket.emit('commandGameRoom', {
					gameRoom: roomName,
					way: 'UP',
					isKeyPress: false
				})
				isUpPressed = false;
			} else if (event.key === 's' || event.key === 'ArrowDown') {
				socket.emit('commandGameRoom', {
					gameRoom: roomName,
					way: 'DOWN',
					isKeyPress: false
				})
				isDownPressed = false;
			}
		}
		// window.addEventListener('keypress', handleKeyDown);
		window.addEventListener('keydown', handleKeyDown);
		window.addEventListener('keyup', handleKeyUp);
		return () => {
			// window.removeEventListener('keypress', handleKeyDown);
			window.removeEventListener('keydown', handleKeyDown);
			window.removeEventListener('keyup', handleKeyUp);
		}
	}, [])

	const	leaveRoom = () => {
		socket.emit('leaveGameRoom', {
			gameRoom: roomName,
		});
	}

	window.onpopstate = async () => {
		socket.emit('leaveGameRoom', {
			gameRoom: roomName,
		});
	}

	if (!liveRoom)
		return (<LoadingPage/>);

	return (
		<div>
			<h1 style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
				{result === undefined
					? `TIME: ${liveRoom.duration}`
					: result
				}
			</h1>
			<div className="Pong">
				<div className="container">
					<div className="gameField">
						<p className="PlayerName" id="leftPlayerName">{liveRoom.playerL.user.login}</p>
						<p className="PlayerName" style={{margin:'0 0 0 auto'}} id="rightPlayerName">{liveRoom.playerR.user.login}</p>
						<div className="ball" style={{top: liveRoom.ball.y, left: liveRoom.ball.x}}/>
						<div className="player1" id="player1" style={{top: liveRoom.playerL.location + 'px'}} />
						<div className="player2" id="player2" style={{top: liveRoom.playerR.location + 'px'}} />
						<div className="left-score">{liveRoom.playerL.score}</div>
						<div className="right-score">{liveRoom.playerR.score}</div>
					</div>
				</div>
			</div>
			<button onClick={leaveRoom}>Leave Game Room</button>
		</div>
	);
}

export default PongGamePage;