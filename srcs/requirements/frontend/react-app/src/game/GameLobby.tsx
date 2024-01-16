import { Routes, Route, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSocket } from '../hooks/SocketHook';
import { useUser } from '../hooks/UserHook';
import LoadingPage from '../utils/LoadingPage';
import "./GameLobby.css";
import { ReactComponent as Map } from '../assets/map/iconMap1.svg';
import fetchRequest from '../utils/fetchRequest';
import { IUser } from '../chat/iChannel';

interface ILobby {
	id: number,
	name: string,
	type: string,
	mode: string, // belki, olabilir
	winScore: number, // yes
	duration: number, // yes
	description: string,
	adminId: number, // belki, sonra
	pRightIsReady: boolean,
	players: IUser, // belki
	playerLeft: IUser, // yes
	playerRight: IUser, // yes
}

const GameLobby = () => {
	const { roomName } = useParams();
	const {socket} = useSocket();
	const my = useUser().userInfo;
	const [lobby, setLobby] = useState<ILobby | undefined>(undefined);
	const navigate = useNavigate();
	
	useEffect(() => {
		const lobbyListener = async ({action}: {action: string | undefined}) => {
			if (action === 'startGame')
			{
				navigate(`/game/${roomName}`, {replace: true});
				return ;
			}
// ===================================
			const response = await fetchRequest({
				method: 'GET',
				url: `/game/room/${roomName}/true`
			})
			if (response.ok){
				const data = await response.json();
				console.log("GameLobby:", data);
				if (!data.err){
					const playerLeft: IUser = data.players.find((player: IUser) => player.id === data.pLeftId);
					const playerRight: IUser = data.players.find((player: IUser) => player.id === data.pRightId);
					const pRightIsReady = data.pRightIsReady;
					setLobby({...data, playerLeft, playerRight, pRightIsReady});
				} else {
					navigate('/404', {replace: true});
				}
			} else {
				console.log("---Backend Connection '❌'---");
			}
		}
		lobbyListener({action: undefined});
		socket.on(`lobbyListener:${roomName}`, lobbyListener);
		return () => {
			socket.off(`lobbyListener:${roomName}`, lobbyListener);
		}
		/* eslint-disable react-hooks/exhaustive-deps */
	}, []);

	if (lobby === undefined){
		return (<LoadingPage />);
	}

	const	readyForGame = async () =>{
		const response = await fetchRequest({
			method: 'PATCH',
			body: JSON.stringify({
				pRightIsReady: !lobby.pRightIsReady,
			}),
			url: `/game/room?room=${lobby.name}`,
		});
		if (response.ok){
			const data = await response.json();
			console.log("fetchGameRoom:", data);
			if (!data.err){
			} else {
				console.log("fetchGameRoom error:", data.err);
			}
		} else {
			console.log("---Backend Connection '❌'---");
		}
	}

	const	startForGame = async () => {
		if (!lobby.pRightIsReady)
			return (console.log("You can't start right player is not ready!"));
		const response = await fetchRequest({
			method: 'PATCH',
			body: JSON.stringify({
				isGameStarted: true,
			}),
			url: `/game/room?room=${lobby.name}`,
		});
		if (response.ok){
			const data = await response.json();
			console.log("fetchGameRoom:", data);
			if (!data.err){
			} else {
				console.log("fetchGameRoom error:", data.err);
			}
		} else {
			console.log("---Backend Connection '❌'---");
		}
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
			{(lobby.adminId === my?.id) ? (
				<button className='start' onClick={startForGame} >{lobby.pRightIsReady ? `You Can Start Game ✅` : `Wait Other Player To Ready ❌`}</button>
			) : (
				<button className='ready'onClick={readyForGame}>{lobby.pRightIsReady ? `Player Is Ready ✅` : `Player Is Unready ❌`}</button>
			)}
		</div>
	);
};

export default GameLobby;