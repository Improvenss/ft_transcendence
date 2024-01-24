import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import fetchRequest from "../../utils/fetchRequest";
import { IUser } from "../../chat/iChannel";
import "./styles.css";
import { useSocket } from "../../hooks/SocketHook";
import { ILobby } from "../GameLobby";
import LoadingPage from "../../utils/LoadingPage";

// interface IRoom {
// 	id: number,
// 	// mode: string, // belki, olabilir
// 	winScore: number, // yes
// 	duration: number, // yes
// 	adminId: number, // belki, sonra
// 	players: IUser, // belki
// 	pLeft: IUser, // yes
// 	pRight: IUser, // yes
// 	ballLocationX: number,
// 	ballLocationY: number,
// 	ballSpeedX: number,
// 	ballSpeedY: number,
// }

// interface IPlayer {
// 	location?: number,
// 	speed?: number,
// 	score?: number,
// }

// interface IBall {
// 	x?: number,
// 	y?: number,
// 	speedX?: number,
// 	speedY?: number,
// }

// interface ILiveData {
// 	ball?: IBall,
// 	playerL?: IPlayer,
// 	playerR?: IPlayer,
// 	duration?: number;
// }

/**
 * pLeftLocation number
 * pRightLocation number
 * ballLocation
 * pLeftScore
 * pRightScore
 * duration
 * @returns 
 */
function PongGamePage() {
	const { roomName } = useParams();
	const navigate = useNavigate();
	const [liveRoom, setLiveRoom] = useState<ILobby>();
	// const [liveRoom, setLiveData] = useState<ILiveData>();
	const { socket } = useSocket();
	const [result, setResult] = useState<string | undefined>(undefined);
	const delay = 16;

	useEffect(() => {
		// const	gameListener = async ({action}:{action: string}) => {
		const	gameListener = async () => {
			const response = await fetchRequest({
				method: 'GET',
				url: `/game/room/${roomName}/false` // lobby'e attik cunku orada aliyoruz zaten bu verileri.
			})
			if (response.ok){
				const data = await response.json();
				console.log("PongGamePage:", data);
				if (!data.err){
					// const pLeft: IUser = data.players.find((player: IUser) => player.id === data.pLeftId);
					// const pRight: IUser = data.players.find((player: IUser) => player.id === data.pRightId);
					const playerLeft: IUser | null = (data.playerL && data.playerL.user)
						? data.players.find((player: IUser) => player.id === data.playerL.user.id)
						: null;
					const playerRight: IUser | null = (data.playerR && data.playerR.user)
						? data.players.find((player: IUser) => player.id === data.playerR.user.id)
						: null;
					setLiveRoom({ ...data, playerLeft, playerRight });
					socket.emit('joinGameRoom', {
						gameRoom: roomName,
					});
				} else {
					navigate('/404', {replace: true});
				}
			} else {
				console.log("---Backend Connection '❌'---");
			}
		}
		gameListener();
	}, [])

	useEffect(() => {
		const	intervalId = setInterval(async() => {
			socket.emit('calcGameData', { gameRoom: roomName });
		}, delay);
		const	handleLiveData = ({action}: {action: ILobby}) => {
			if (!action)
				return ;
			// setLiveData(action);
			// setLiveRoom(...action, action)
			setLiveRoom(prevLiveRoom => ({...prevLiveRoom, ...action}));
		}
		const	finishGameData = ({ result }: { result: string }) => {
			clearInterval(intervalId);
			setResult(result)
			// setTimeout(() => { // 5 saniye sonra /game 'ye yonlendirilecek.
			// 	setInterval(() => {
			// 		setResult(...oldResult, result);
			// 	}, 1000)
			// 	navigate('/game', {replace: true});
			// }, 5000);
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
			clearInterval(intervalId);
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

	if (!liveRoom)
		return (<LoadingPage/>);

	return (
		<div>
			<button onClick={leaveRoom}>Leave Game Room BRUH</button>
			<h1 style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
				{result === undefined
					? `TIME: ${liveRoom.duration}`
					: result
				}
			</h1>
			<div className="Pong">
				<div className="container">
					<div className="gameField">
						<p className="PlayerName" id="leftPlayerName">{liveRoom.playerLeft.login}</p>
						<p className="PlayerName" style={{margin:'0 0 0 auto'}} id="rightPlayerName">{liveRoom.playerRight.login}</p>
						<div className="ball" style={{top: liveRoom.ball.y, left: liveRoom.ball.x}}/>
						<div className="player1" id="player1" style={{top: liveRoom.playerL.location + 'px'}} />
						<div className="player2" id="player2" style={{top: liveRoom.playerR.location + 'px'}} />
						<div className="left-score">{liveRoom.playerL.score}</div>
						<div className="right-score">{liveRoom.playerR.score}</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default PongGamePage;