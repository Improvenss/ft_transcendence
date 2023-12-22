import Cookies from 'js-cookie';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSocket } from '../hooks/SocketHook';
import LoadingPage from '../utils/LoadingPage';
import "./GameLobby.css";
import { ReactComponent as Map } from './map1.svg';

interface Lobby {
	admins: any,
	players: any,
	mode: 'classic',
	name: string,
	winScore: number,
}

const GameLobby = () => {
	const { roomName } = useParams();
	const userCookie = Cookies.get("user");
	const socket = useSocket();
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
				admins: data.admins
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
			<div className='players'>
				<span className='leftPlayer'>{lobby.players[0].login}</span>
				<span className='rightPlayer'>{lobby.players[1] ? lobby.players[1].login : 'null'} </span>
			</div>
			<Map className='map'/>
			<button className='start'>Start Game</button>
		</div>
	);
};

export default GameLobby;
