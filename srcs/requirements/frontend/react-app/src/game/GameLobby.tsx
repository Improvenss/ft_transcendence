import Cookies from 'js-cookie';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSocket } from '../hooks/SocketHook';
import { useUser } from '../hooks/UserHook';
import LoadingPage from '../utils/LoadingPage';
import "./GameLobby.css";
import { ReactComponent as Map } from '../assets/map/iconMap1.svg';

export interface IUser {
	login: string;
	imageUrl: string;
	nickname: string;
	avatar: string;
	status: string;
}

interface Lobby {
	admin: IUser,
	playerLeft: IUser,
	playerRight: IUser,
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
	const navigate = useNavigate();
	const location = useLocation();
	
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
			console.log("GameLobby:", data);
			setLobby({
				mode: data.mode,
				name: data.name,
				winScore: data.winScore,
				playerLeft: data.players[0],
				playerRight: data.players[1],
				admin: data.players[0],
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
		/* eslint-disable react-hooks/exhaustive-deps */
	}, [socket]);


	useEffect(() => {
		console.log("CIKTIM");
	},[location.pathname])

	if (lobby === undefined){
		return (<LoadingPage />);
	}

	const	LoadPongGame = () =>{
		// const _game = new PongGame({});

		// if (lobby.playerRight)
		// {
			navigate(`/game/${roomName}`);
		// }
	}

	// Lobbye katılan kişinin admin veya user olma durumuna göre hazırım / oyunu başlat gibi yapılara sahip olması gerekmektedir.
	return (
		<div id='lobby'>
			<h2>Lobby #{roomName}</h2>
			<h3>Game Mode: {lobby.mode}</h3>
			<h3>Win Score: {lobby.winScore}</h3>
			<h3>Duration: {lobby.duration} second</h3>
			<div className='players'>
				{lobby.playerLeft ? (
					<div className='leftPlayer'>
						<img
							className='image'
							src={lobby.playerLeft.avatar ? lobby.playerLeft.avatar : lobby.playerLeft.imageUrl}
							alt={lobby.playerLeft.login}
						/>
						<span>{lobby.playerLeft.nickname ? lobby.playerLeft.nickname : lobby.playerLeft.login}</span>
					</div>
				) : 'null'}
				{lobby.playerRight ? (
					<div className='rightPlayer'>
						<img
							className='image'
							src={lobby.playerRight.avatar ? lobby.playerRight.avatar : lobby.playerRight.imageUrl}
							alt={lobby.playerRight.login}
						/>
						<span>{lobby.playerRight.nickname ? lobby.playerRight.nickname : lobby.playerRight.login}</span>
					</div>
				) : (
					<button className='invite'>Invite</button>
				)}
			</div>
			<Map className='map'/>
			{(lobby.admin.login === my?.login) ? (
				<button className='start' onClick={LoadPongGame} >Start Game</button>
			) : (
				<button className='ready'>Ready</button>
			)}
		</div>
	);
};

export default GameLobby;
