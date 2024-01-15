import { Routes, Route, Link } from 'react-router-dom';
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

function App() {
	console.log("---------APP-PAGE---------");
	const { setAuth } = useAuth();
	const { userInfo } = useUser();

	function logOut() {
		//localStorage.clear();
		Cookies.remove('user');
		Cookies.remove('twoFA');
		setAuth(false);
	}

	return (
		<div id="app">
			{/* <FallingChars /> */}
			<header>
				<nav id='app-header'>
					<Link to='/' id="site-name" className='link'>TRANSCENDENCE</Link>
					<Link to="/" className='link'>Home</Link>
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
				<Route path='/profile/:username' element={<ProfilePage />} />
				<Route path='/chat' element={<ChatPage />} />
				<Route path='/game' element={<GamePage />} />
				<Route path='/game/lobby/:roomName' element={<GameLobby />} />
				<Route path='*' element={<NoMatchPage />} />
			</Routes>
		</div>
	);
};

export default App;