import { useNavigate } from 'react-router-dom';
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
import Modal from '../utils/Modal';

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
	console.log("---------LOBBY---------");
	const { roomName } = useParams();
	const {socket} = useSocket();
	const {userInfo} = useUser();
	const [lobby, setLobby] = useState<ILobby | undefined>(undefined);
	const navigate = useNavigate();
	const [isModalOpen, setModalOpen] = useState(false);
	
	window.onpopstate = async () => {
		const response = await fetchRequest({
			method: 'GET',
			url: '/users/test'
		});
	}

	const friends = [
		{login: 'abc', avatar: 'https://maxst.icons8.com/vue-static/landings/page-index/hero/hero-products/icons1x.webp', nickname: 'test', status: 'online', imageUrl: ''},
		{login: 'abcde', avatar: 'https://maxst.icons8.com/vue-static/landings/page-index/hero/hero-products/icons1x.webp', nickname: 'test', status: 'online', imageUrl: ''},
		{login: 'abcdef', avatar: 'https://maxst.icons8.com/vue-static/landings/page-index/hero/hero-products/icons1x.webp', nickname: 'test', status: 'online', imageUrl: ''},
		{login: 'abcdeff', avatar: 'https://maxst.icons8.com/vue-static/landings/page-index/hero/hero-products/icons1x.webp', nickname: 'test', status: 'online', imageUrl: ''},
		{login: 'abcdeffd', avatar: 'https://maxst.icons8.com/vue-static/landings/page-index/hero/hero-products/icons1x.webp', nickname: 'test', status: 'online', imageUrl: ''},
	];

	//   if (lobby && !lobby?.playerRight) {
	// 	lobby.playerRight = {
	// 		id: 5,
	// 		status: 'offline',
	// 	  avatar: 'https://maxst.icons8.com/vue-static/landings/page-index/hero/hero-products/icons1x.webp',
	// 	  login: 'abc',
	// 	  imageUrl: '',
	// 	  nickname: '',
	// 	};
	//   }

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

	const handleLobbyAction = async (action: 'ready' | 'start') => {
		if (action === 'start' && !lobby.pRightIsReady)
			return (console.log("You can't start right player is not ready!"));
		const response = await fetchRequest({
			method: 'PATCH',
			body: (action === 'start' ? (
				JSON.stringify({
					isGameStarted: true,
				})
			):(
				JSON.stringify({
					pRightIsReady: !lobby.pRightIsReady,
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

	return (
		<div id='lobby'>
			<IconLeave id='leave-lobby' title='leave' onClick={() => console.log("leave")}/>
			<h2>Lobby #{roomName}</h2>
			<h2>Lobby Type: {lobby.type}</h2>
			{lobby.description && (<h2>Description: {lobby.description}</h2>)}
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
					<div className='rightPlayer' title='kick' onClick={() => console.log("kick yapısını ekle")}>
						<img
							className='image'
							src={lobby.playerRight.avatar ? lobby.playerRight.avatar : lobby.playerRight.imageUrl}
							alt={lobby.playerRight.login}
						/>
						<span>{lobby.playerRight.nickname ? lobby.playerRight.nickname : lobby.playerRight.login}</span>
						<IconKick id='kick'/>
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
									{/* {userInfo.friends.map((user) => ( */}
									{friends.map((user) => (
										<div
											key={user.login}
											className={`friend-card`}
											onClick={() => console.log("invite yapısı ekle")}
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
			{(lobby.adminId === userInfo.id) ? (
				<button className='start' onClick={() =>handleLobbyAction('start')} >
					{lobby.pRightIsReady ? `You Can Start Game ✅` : `Wait Other Player To Ready ❌`}
				</button>
			) : (
				<button className='ready' onClick={() => handleLobbyAction('ready')}>
					{lobby.pRightIsReady ? `Player Is Ready ✅` : `Player Is Unready ❌`}
				</button>
			)}
		</div>
	);
};

export default GameLobby;
