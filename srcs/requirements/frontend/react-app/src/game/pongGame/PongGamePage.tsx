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
}

interface ILiveData {
	ballLocationX?: number;
	ballLocationY?: number;
	pLeftLocation?: number;
	pRightLocation?: number;
	pLeftScore?: number;
	pRightScore?: number;
	duration?: number;
}

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
	const { socket }= useSocket();

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
		const	handleLiveData = ({action}: {action: ILiveData}) => {
			console.log("socketen gelen veri ILiveData tipindekiler", action)
		}

		socket.on(`updateGameData:${roomName}`, handleLiveData);

		return () => {
			socket.off(`updateGameData:${roomName}`, handleLiveData);
		};
	}, [socket])

	return (
		<div>
			{/* <button onClick={LeaveRoom}>leaveGameRoom</button> */}
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