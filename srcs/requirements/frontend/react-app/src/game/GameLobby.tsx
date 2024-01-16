import { Routes, Route, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSocket } from '../hooks/SocketHook';
import { useUser } from '../hooks/UserHook';
import LoadingPage from '../utils/LoadingPage';
import "./GameLobby.css";
import { ReactComponent as Map } from '../assets/map/iconMap1.svg';
import fetchRequest from '../utils/fetchRequest';
import { useAuth } from '../hooks/AuthHook';
import { IUser } from '../chat/iChannel';
import { userInfo } from 'os';

interface Lobby {
	id: number,
	name: string,
	type: string,
	mode: string,
	winScore: number,
	duration: number,
	description: string,
	adminId: number,
	players: IUser,
	playerLeftId: number,
	playerRightId: number,
	playerLeft: IUser,
	playerRight: IUser,
}

const GameLobby = () => {
	const { roomName } = useParams();
	const {socket} = useSocket();
	const my = useUser().userInfo;
	const [lobby, setLobby] = useState<Lobby | undefined>(undefined);
	const navigate = useNavigate();
	const location = useLocation();
	const {isAuth} = useAuth();
	const [pRightIsReady, setPRightIsReady] = useState(false);
	
	useEffect(() => {
		if (isAuth){
			const fetchLobby = async () => {
				const response = await fetchRequest({
					method: 'GET',
					url: `/game/lobby/${roomName}`
				})
				if (response.ok){
					const data = await response.json();
					console.log("GameLobby:", data);
					if (!data.err){
						const playerLeft: IUser = data.players.find((player: IUser) => player.id === data.pLeftId);
						const playerRight: IUser = data.players.find((player: IUser) => player.id === data.pRightId);
						console.log("playerLeft:", playerLeft);
						console.log("playerRight:", playerRight);
						setLobby({...data, playerLeft, playerRight});
						console.log("setPRightIsReady", data.pRightIsReady);
						setPRightIsReady(data.pRightIsReady);
					} else {
						navigate('/404', {replace: true});
					}
				} else {
					console.log("---Backend Connection '❌'---");
				}
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
		}
		/* eslint-disable react-hooks/exhaustive-deps */
	}, [socket]);

	useEffect(() => {
		console.log("CIKTIM");
	},[location.pathname])
		
	if (!isAuth)
		return (
			<Navigate to='/login' replace />
		);

	if (lobby === undefined){
		return (<LoadingPage />);
	}

	const	readyForGame = async () =>{
		// socket?.emit('readyForGame', {roomName: roomName, login: my.login});
		console.log("oncesi", pRightIsReady);
		setPRightIsReady(!pRightIsReady);
		console.log("sonrasi", pRightIsReady);
		const response = await fetchRequest({
			method: 'PATCH',
			body: JSON.stringify({
				pRightIsReady: pRightIsReady,
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
	const	LoadPongGame = () =>{
		socket?.emit('startForGame', {roomName: roomName, login: my.login});
		// navigate(`/game/${roomName}`, {replace: true});
	}
	socket?.on('loadGame', () => {
		if (lobby.playerRight && lobby.playerLeft)
		{
			navigate(`/game/${roomName}`, {replace: true});
		}
	});
	socket?.on('otherPlayerNotReady', () => {
		console.log("The other player is not ready!");
	});

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
				<button className='start' onClick={LoadPongGame} >{pRightIsReady ? `You Can Start Game ✅` : `Wait Other Player To Ready ❌`}</button>
			) : (
				<button className='ready'onClick={readyForGame}>{pRightIsReady ? `Player Is Ready ✅` : `Player Is Unready ❌`}</button>
			)}
		</div>
	);
};

export default GameLobby;