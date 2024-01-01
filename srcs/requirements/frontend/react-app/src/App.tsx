import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import './App.css';
import HomePage from "./main/HomePage";
import Api from "./login/Api";
import NoMatchPage from "./main/NoMatchPage";
import LoginPage from "./login/LoginPage";
import Cookies from 'js-cookie';
import ChatPage from "./chat/ChatPage";
import { useAuth } from "./hooks/AuthHook";
import { ReactComponent as IconGithub } from './assets/iconGithub.svg';
import FallingChars from "./utils/FallingChars";
import { useUser } from "./hooks/UserHook";
import ProfilePage from "./user/ProfilePage";
import GamePage from './game/GamePage';
import GameLobby from './game/GameLobby';
import Notification from './Notification';

function App() {
	console.log("---------APP-PAGE---------");
	const { isAuth, setAuth } = useAuth();
	const { userInfo } = useUser();
	const navigate = useNavigate();

	function logOut() {
		localStorage.clear();
		Cookies.remove('user');
		setAuth(false);
		// localStorage.removeItem('user');
		//return <Navigate to='/login' replace />; //geri butonuna basınca mal olmasın diye ekleniyor
		navigate('/login', {replace: true}); //return kullanarak çevirince set'lemeler bitmeden HOME-PAGE'ye giriyor.
	}

	return (
		<div id="app">
			{isAuth && <FallingChars />}
			<header>
				{isAuth ? (
					<>
					<ul id='app-header'>
						<Link to='/' id="site-name">TRANSCENDENCE</Link>
						<Link to="/">Home</Link>
						<Link to="/chat">Chat</Link>
						<Link to="/game">Game</Link>
						<span onClick={logOut}>Logout</span>
						<Link to={`/profile/${userInfo?.login}`}>
							{userInfo?.avatar ? (
								<img src={userInfo.avatar} alt="Profile" />
							) : (
								<img src={userInfo?.imageUrl} alt="Profile" />
							)}
						</Link>
						<Notification />
					</ul>
					</>
				) : (
					<nav>
						<a href="https://github.com/Improvenss/ft_transcendence">
							<IconGithub id="icon-github" />
						</a>
					</nav>
				)}
			</header>
			<Routes>
				<Route path='/' element={<HomePage />} />
				<Route path='/profile' element={<ProfilePage />} />
				<Route path='/profile/:username' element={<ProfilePage />} />
				<Route path='/chat' element={<ChatPage />} />
				<Route path='/game' element={<GamePage />} />
				<Route path='/game/lobby/:roomName' element={<GameLobby />} />
				<Route path='*' element={<NoMatchPage />} />
				<Route path='/api' element={<Api />} />
				<Route path='/login' element={<LoginPage />} />
			</Routes>
		</div>
	);
};

export default App;