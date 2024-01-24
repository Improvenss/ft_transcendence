import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSocket } from '../hooks/SocketHook';
import { useUser } from '../hooks/UserHook';
import LoadingPage from '../utils/LoadingPage';
import "./GameLobby.css";
import { ReactComponent as Map } from '../assets/map/iconMap1.svg';
import { ReactComponent as IconLeave } from '../assets/game/iconLeave.svg';
import { ReactComponent as IconKick } from '../assets/game/iconKick.svg';
import fetchRequest from '../utils/fetchRequest';
import { IUser } from '../chat/iChannel';
import { IGameRoom } from './IGame';
import Modal from '../utils/Modal';
import handleRequest from '../utils/handleRequest'

interface IPlayer {
	user: {
		id: number,
		login: string,
		socketId: string,
	},
	location: number,
	ready: boolean,
	score: number,
	speed: number,
}

interface IBall {
	x?: number,
	y?: number,
	speedX?: number,
	speedY?: number,
}

export interface ILobby {
	id: number,
	name: string,
	description: string,
	type: string,
	mode: string,
	winScore: number,
	duration: number,
	players: IUser[],
	playerL: IPlayer,
	playerR: IPlayer,
	ball: IBall,
	playerLeft: IUser,
	playerRight: IUser,
}

const GameLobby = () => {
	console.log("---------LOBBY---------");
	const { roomName } = useParams();
	const {socket} = useSocket();
	const {userInfo} = useUser();
	const [lobby, setLobby] = useState<ILobby | undefined>(undefined);
	const navigate = useNavigate();
	const [isModalOpen, setModalOpen] = useState(false);
	const location = useLocation();
	
	window.onpopstate = async () => {
		const response = await fetchRequest({
			method: 'GET',
			url: '/users/test'
		});
	}

	useEffect(() => {
		const lobbyListener = async ({action}: {action: string | undefined}) => {
			if (action === 'startGame')
			{
				navigate(`/game/${roomName}`, {replace: true});
				return ;
			}
			const response = await fetchRequest({
				method: 'GET',
				url: `/game/room/${roomName}/true`
			})
			if (response.ok){
				const data = await response.json();
				console.log("GameLobby:", data);
				if (!data.err){
					const playerLeft: IUser | null = (data.playerL && data.playerL.user)
						? data.players.find((player: IUser) => player.id === data.playerL.user.id)
						: null;
					const playerRight: IUser | null = (data.playerR && data.playerR.user)
						? data.players.find((player: IUser) => player.id === data.playerR.user.id)
						: null;
					setLobby({ ...data, playerLeft, playerRight });
				} else {
					if (action === 'leave')
					{
						navigate('/game', {replace: true});
						return ;
					}
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

	const handleLobbyAction = async (action: 'ready' | 'start') => {
		if (action === 'start' && !lobby.playerR.ready)
			return (console.log("You can't start right player is not ready!"));
		const response = await fetchRequest({
			method: 'PATCH',
			body: (action === 'start' ? (
				JSON.stringify({
					running: true,
				})
			):(
				JSON.stringify({
					playerR: {
						...lobby.playerR,
						ready: !lobby.playerR.ready
					},
				})
			)),
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

	const	leaveButton = async () => {
		const currentPath = location.pathname;
		const userConfirmed = window.confirm('Are you sure do want to leave the lobby?');
		if (!userConfirmed) {
		} else {
			const roomName = currentPath.replace('/game/lobby/', '');
			const response = await fetchRequest({
				method: 'DELETE',
				url: `/game/room/leave?room=${roomName}`
			});
			// console.log('Fetch Response:', response);
			navigate('/game', { replace: true });
		}
	}

	const handleInvitePlayer = async (target: string) => {
		console.log("invite player");

		const response = await fetchRequest({
			method: 'PATCH',
			body: JSON.stringify({
				invitedPlayer: target ,
			}),
			url: `/game/room?room=${lobby.name}`,
		});

		if (response.ok)
		{
			const data = await response.json();
			if (!data.err)
			{
				handleRequest('sendGameInviteRequest', target, undefined, lobby.name);
			}
			else
				console.log("Invite data err", data.err);
		} else {
			console.log("---Backend Connection '❌'---");
		}
	}

	const	handleKickPlayer = async (target: string) => {
		console.log("kick playere geldi");
		const response = await fetchRequest({
			method: 'DELETE',
			headers: {
				'game': roomName as string,
			},
			url: `/game/room/kick?targetUser=${target}`,
		});
		if (response.ok)
		{
			const data = await response.json();
			if (!data.err)
				console.log(data);
			else
				console.log("Game Lobby Kick User error", data.err);
		} else {
			console.log("---Backend Connection '❌'---");
		}
	}

	if (!roomName)
		return (<LoadingPage/>);

	return (
		<div id='lobby'>
			<IconLeave id='leave-lobby' title='leave' onClick={() => leaveButton()} />
			{/* <IconLeave id='leave-lobby' title='leave' onClick={() => console.log("leave")}/> */}
			<h2>Lobby #{roomName}</h2>
			<h2>Lobby Type: {lobby.type}</h2>
			{lobby.description && (<h2>Description: {lobby.description}</h2>)}
			<div className='players'>
				{lobby.playerL.user ? (
					<div className='leftPlayer'>
						<img
							className='image'
							src={lobby.playerLeft.avatar ? lobby.playerLeft.avatar : lobby.playerLeft.imageUrl}
							alt={lobby.playerL.user.login}
						/>
						<span>{lobby.playerLeft.nickname ? lobby.playerLeft.nickname : lobby.playerL.user.login}</span>
					</div>
				) : 'null'}
				{lobby.playerR.user ? (
					<div className='rightPlayer' title='kick' onClick={() => userInfo.id === lobby.playerL.user.id && handleKickPlayer(lobby.playerR.user.login)}>
						<img
							className='image'
							src={lobby.playerRight.avatar ? lobby.playerRight.avatar : lobby.playerRight.imageUrl}
							alt={lobby.playerR.user.login}
						/>
						<span>{lobby.playerRight.nickname ? lobby.playerRight.nickname : lobby.playerR.user.login}</span>
						{userInfo.id === lobby.playerL.user.id && (<IconKick id='kick'/>)}
					</div>
				) : (
					<>
						<button className={`invite-friend ${isModalOpen ? 'open' : null}`} onClick={() => setModalOpen(!isModalOpen)}>
							Invite
						</button>
						{isModalOpen && (
							<Modal
								isOpen={isModalOpen}
								onClose={() => setModalOpen(false)}
								mouse={true}
								overlayClassName='invite-overlay'
								modalClassName='invite-modal'
								closeButtonClassName='invite-close-button'
							>
								<div id='friends-modal-header'>Invite Friends</div>
								<div id='friends-content'>
									{userInfo.friends.map((user) => (
										<div
											key={user.login}
											className={`friend-card`}
											onClick={() => handleInvitePlayer(user.login)}
										>
											<img src={user.avatar ? user.avatar : user.imageUrl} alt={user.login}/>
											<div id='friend-users-table'>
												<span>{user.nickname ? user.nickname : user.login}</span>
												<span>Status: {user.status}</span>
											</div>
										</div>
									))}
								</div>
							</Modal>
						)}
					</>
				)}
			</div>
			<h3>Game Mode: {lobby.mode}</h3>
			<h3>Win Score: {lobby.winScore}</h3>
			<h3>Duration: {lobby.duration} second</h3>
			<Map className='map'/>
			{(lobby.playerL.user.id === userInfo.id) ? (
				<button className='start' onClick={() =>handleLobbyAction('start')} >
					{lobby.playerR.ready ? `You Can Start Game ✅` : `Wait Other Player To Ready ❌`}
				</button>
			) : (
				<button className='ready' onClick={() => handleLobbyAction('ready')}>
					{lobby.playerR.ready ? `Player Is Ready ✅` : `Player Is Unready ❌`}
				</button>
			)}
		</div>
	);
};

export default GameLobby;
