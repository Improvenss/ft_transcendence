import { Routes, Route, Link, useLocation, useParams } from 'react-router-dom';
import HomePage from "./home/HomePage";
import NoMatchPage from "./utils/NoMatchPage";
import Cookies from 'js-cookie';
import ChatPage from "./chat/ChatPage";
import { useAuth } from "./hooks/AuthHook";
import FallingChars from "./utils/FallingChars";
import { useUser } from "./hooks/UserHook";
import ProfilePage from "./user/ProfilePage";
import GamePage from './game/GamePage';
import GameLobby from './game/GameLobby';
import Notification from './user/Notification';
import Settings from './user/Settings';
import './App.css';
import PongGamePage from './game/pongGame/PongGamePage';
import fetchRequest from './utils/fetchRequest';
import { useEffect } from 'react';
import Leaderboard from './game/Leaderboard';
import { useSocket } from './hooks/SocketHook';

function App() {
	// console.log("---------APP-PAGE---------");
	const { setAuth } = useAuth();
	const { userInfo } = useUser();
	const location = useLocation();
	const { socket } = useSocket();

	useEffect(() => {
		const handleLinkClick = async (event: any) => { 
			const newPath = event.currentTarget.getAttribute("href");
			const currentPath = location.pathname;
			const roomNameLobby = currentPath.replace('/game/lobby/', '');
			const roomNameGame = currentPath.replace('/game/', '');
			if (currentPath.startsWith('/game/lobby/') && !newPath.startsWith('/game/lobby/')) {
				const userConfirmed = window.confirm('Are you sure do want to leave the lobby?');
				if (!userConfirmed) {
					event.preventDefault();
				} else {
					const response = await fetchRequest({
						method: 'DELETE',
						url: `/game/room/leave?room=${roomNameLobby}`
					});
				}
			}
			else if (currentPath.startsWith(`/game/${roomNameGame}`) && !newPath.startsWith(`/game/${roomNameGame}`)) {
				const userConfirmed = window.confirm('Are you sure do want to leave the Game Room?');
				if (!userConfirmed) {
					event.preventDefault();
				} else {
					console.log("kekekekekkeke;");
					socket.emit('leaveGameRoom', {
						gameRoom: roomNameGame,
					});
				}
			}
		};

		const navLinks = document.querySelectorAll('a.link');
		navLinks.forEach(link => link.addEventListener('click', handleLinkClick));
		return () => {
		  navLinks.forEach(link => link.removeEventListener('click', handleLinkClick));
		};
	}, [location.pathname]);

	function logOut() {
		//localStorage.clear();
		Cookies.remove('user');
		Cookies.remove('twoFA');
		setAuth(false);
	}

	return (
		<div id="app">
			<FallingChars />
			<header>
				<nav id='app-header'>
					<Link to='/' id="site-name" className='link'>TRANSCENDENCE</Link>
					{/* <Link to="/" className='link'>Home</Link> */}
					<Link to='/leaderboard' className='link'>Leaderboard</Link>
					<Link to="/chat" className='link'>Chat</Link>
					<Link to="/game" className='link'>Game</Link>
					<span onClick={logOut} className='link'>Logout</span>
					<Link to={`/profile/${userInfo.login}`} className='link'>
						<img
							src={userInfo.avatar ? userInfo.avatar : userInfo.imageUrl}
							alt={userInfo.avatar ? 'avatar' : 'intra-image'}
						/>
					</Link>
					<Notification />
					<Settings />
				</nav>
			</header>
			<Routes>
				<Route path='/' element={<HomePage />} />
				<Route path='/leaderboard' element={<Leaderboard />} />
				<Route path='/profile/:username' element={<ProfilePage />} />
				<Route path='/chat' element={<ChatPage />} />
				<Route path='/game' element={<GamePage />} />
				<Route path='/game/:roomName' element={<PongGamePage />} />
				<Route path='/game/lobby/:roomName' element={<GameLobby />} />
				<Route path='*' element={<NoMatchPage />} />
			</Routes>
		</div>
	);
};

export default App;