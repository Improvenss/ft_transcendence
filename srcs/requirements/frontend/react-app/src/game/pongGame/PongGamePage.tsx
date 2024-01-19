import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import fetchRequest from "../../utils/fetchRequest";
import { IUser } from "../../chat/iChannel";
import "./styles.css";
import { useSocket } from "../../hooks/SocketHook";

interface IRoom {
	id: number,
	// mode: string, // belki, olabilir
	winScore: number, // yes
	duration: number, // yes
	adminId: number, // belki, sonra
	players: IUser, // belki
	pLeft: IUser, // yes
	pRight: IUser, // yes
	ballLocationX: number,
	ballLocationY: number,
	ballSpeedX: number,
	ballSpeedY: number,
}

interface ILiveData {
	ballLocationX?: number;
	ballLocationY?: number;
	pLeftLocation?: number;
	pRightLocation?: number;
	// pLeftSpeed?: number;
	// pRightSpeed?: number;
	pLeftScore?: number;
	pRightScore?: number;
	duration?: number;
	winner?: number;
	looser?: number;
}

// interface IFinishData {
// 	winner: number,
// 	looser: number,
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
	const [liveRoom, setLiveRoom] = useState<IRoom | undefined>(undefined);
	const [liveData, setLiveData] = useState<ILiveData>();
	const { socket } = useSocket();
	const [winner, setWinner] = useState<number | string | undefined>(undefined);
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
					const pLeft: IUser = data.players.find((player: IUser) => player.id === data.pLeftId);
					const pRight: IUser = data.players.find((player: IUser) => player.id === data.pRightId);
					setLiveRoom({...data, pLeft, pRight});
					setLiveData({
						ballLocationX: data.ballLocationX,
						ballLocationY: data.ballLocationY,
						duration: data.duration,
						pLeftLocation: data.pLeftLocation,
						pRightLocation: data.pRightLocation,
						pLeftScore: data.pLeftScore,
						pRightScore: data.pRightScore,
					});
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
		const	handleLiveData = ({action}: {action: ILiveData}) => {
			if (!action)
				return ;
			setLiveData(action);
		}
		const	finishGameData = ({action, isTie}: {action: number, isTie: boolean}) => {
			clearInterval(intervalId);
			setWinner(isTie ? 'tie' : action);
			setTimeout(() => { // 5 saniye sonra /game 'ye yonlendirilecek.
				navigate('/game', {replace: true});
			}, 5000);
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

	return (
		<div>
			<button onClick={leaveRoom}>Leave Game Room BRUH</button>
			<h1 style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
				{winner === undefined
					? `TIME: ${liveData?.duration}`
					: winner === 'tie'
						? 'TIME IS UP! TIE'
						: `Winner Player ${
							liveRoom?.pLeft.id === winner
								? liveRoom.pLeft.login
								: liveRoom?.pRight.login
							}`
				}
			</h1>
			<div className="Pong">
				<div className="container">
					<div className="gameField">
						<p className="PlayerName" id="leftPlayerName">{liveRoom?.pLeft.login}</p>
						<p className="PlayerName" style={{margin:'0 0 0 auto'}} id="rightPlayerName">{liveRoom?.pRight.login}</p>
						<div className="ball" style={{top: liveData?.ballLocationY, left: liveData?.ballLocationX}}/>
						<div className="player1" id="player1" style={{top: liveData?.pLeftLocation + 'px',}} />
						<div className="player2" id="player2" style={{top: liveData?.pRightLocation + 'px',}} />
						<div className="left-score">{liveData?.pLeftScore}</div>
						<div className="right-score">{liveData?.pRightScore}</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default PongGamePage;