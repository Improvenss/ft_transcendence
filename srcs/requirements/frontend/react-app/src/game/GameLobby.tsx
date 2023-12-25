import Cookies from 'js-cookie';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSocket } from '../hooks/SocketHook';
import { useUser } from '../hooks/UserHook';
import LoadingPage from '../utils/LoadingPage';
import "./GameLobby.css";
import { ReactComponent as Map } from './map1.svg';

export interface IUser {
	login: string;
	imageUrl: string;
	nickname: string;
	avatar: string;
	status: string;
}

interface Lobby {
	admins: IUser[], // 1 tane admin olabilir düzelt
	players: IUser[],
	mode: 'classic',
	name: string,
	winScore: number,
	duration: number,
}

const GameLobby = () => {
	const { roomName } = useParams();
	const userCookie = Cookies.get("user");
	const socket = useSocket();
	const my = useUser().userInfo;
	const [lobby, setLobby] = useState<Lobby | undefined>(undefined);

	useEffect(() => {
		const fetchLobby = async () => {
			const response = await fetch(process.env.REACT_APP_FETCH + `/game/room?room=${roomName}&relations=all`, {
				method: 'GET',
				headers: {
					"Authorization": "Bearer " + userCookie,
				}
			});
			if (!response.ok)
				throw (new Error("API fetch error."));
			const data = await response.json();
			console.log("GameLobby:",data);
			setLobby({
				mode: data.mode,
				name: data.name,
				winScore: data.winScore,
				players: data.players,
				admins: data.admins,
				duration: data.duration,
			});
			// oda olmama durumu, odaya register olmayan kullanıcı durumunun kontrol edilip yönlendirilmesi yapılması gerekmektedir.
		}
		fetchLobby();

		const	lobbyListener = () => {
			fetchLobby();
		}
		socket?.on(`lobbyListener:${roomName}`, lobbyListener);
		return () => {
			socket?.off(`lobbyListener:${roomName}`, lobbyListener);
		}
	}, [socket]);

	if (lobby === undefined){
		return (<LoadingPage />);
	}

	// Lobbye katılan kişinin admin veya user olma durumuna göre hazırım / oyunu başlat gibi yapılara sahip olması gerekmektedir.
	return (
		<div id='lobby'>
			<h2>Lobby #{roomName}</h2>
			<h3>Game Mode: {lobby.mode}</h3>
			<h3>Win Score: {lobby.winScore}</h3>
			<h3>Duration: {lobby.duration} second</h3>
			<div className='players'>
				{lobby.players[0] ? (
					<div className='leftPlayer'>
						<img className='image' src={lobby.players[0].avatar ? lobby.players[0].avatar : lobby.players[0].imageUrl}/>
						<span>{lobby.players[0].nickname ? lobby.players[0].nickname : lobby.players[0].login}</span>
					</div>
				) : 'null'}
				{lobby.players[1] ? (
					<div className='rightPlayer'>
						<img className='image' src={lobby.players[1].avatar ? lobby.players[1].avatar : lobby.players[1].imageUrl}/>
						<span>{lobby.players[1].nickname ? lobby.players[1].nickname : lobby.players[1].login}</span>		
					</div>
				) : 'null'}
			</div>
			<Map className='map'/>
			{lobby.admins.some((admin) => admin.login === my?.login) ? ( //admin sayısı teke düşürüldüğünde some methodu kaldırılacak.
				<button className='start'>Start Game</button>
			) : (
				<button className='ready'>Ready</button>
			)}
		</div>
	);
};

export default GameLobby;
