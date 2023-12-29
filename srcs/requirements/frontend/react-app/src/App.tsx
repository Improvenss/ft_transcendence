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
import { ReactComponent as IconNotifs } from './assets/iconNotification.svg';
import { useEffect, useState } from 'react';
import { useSocket } from './hooks/SocketHook';
import handleRequest from './utils/handleRequest'

interface INotifs {
	id: number,
	type: 'text' | 'sendFriendRequest',
	text: string,
	date: string,
	read: boolean,
	from: string,
}

function App() {
	console.log("---------APP-PAGE---------");
	const { isAuth, setAuth } = useAuth();
	const socket = useSocket();
	const userCookie = Cookies.get("user");
	const { userInfo } = useUser();
	const navigate = useNavigate();
	const [showNotifs, setShowNotifs] = useState<boolean>(false);
	const [unreadNotifs, setUnreadNotifs] = useState<number>(0);
	const [notifications, setNotifications] = useState<INotifs[]>([]);

	useEffect(() => {
		if (isAuth){
			const checkNotifs = async () => {
				const response = await fetch(process.env.REACT_APP_FETCH + `/users?action=notifications`, {
					method: "GET",
					headers: {
						"Content-Type": "application/json",
						"Authorization": "Bearer " + userCookie as string,
					},
				});
				if (response.ok){
					const data = await response.json();
					console.log("notification:",data);
					setNotifications(data.notifications);
					const unreadCount = data.notifications.filter((notification: INotifs) => !notification.read).length;
					setUnreadNotifs(unreadCount);
				}
			}
			checkNotifs();

			const handleListenNotifs = (newNotifs: any) => {
				console.log("Notifs Geldi:", newNotifs);
				setNotifications(prevNotifs => [
					...prevNotifs,
					newNotifs
				]);

				if (!newNotifs.read) {
					setUnreadNotifs(prevCount => prevCount + 1);
				}

				const notifsContainer = document.getElementById("notifs-content");
				if (notifsContainer){
					notifsContainer.scrollTop = 0;
				}
			}

			socket?.on(`userNotifs:${userInfo?.login}`, handleListenNotifs);
			return () => {
				socket?.off(`userNotifs:${userInfo?.login}`, handleListenNotifs);
			};
		}
	}, []);

	useEffect(() => {
		if (isAuth){
			if (unreadNotifs > 0){
				socket?.emit('markAllNotifsAsRead');
				setUnreadNotifs(0);
			}
		}
	}, [showNotifs]);

	const formatTimeAgo = (dateString: string) => {
		const	now = new Date();
		const	date = new Date(dateString);
		const	seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

		const intervals = [
			{ label: 'year', seconds: 31536000 },
			{ label: 'month', seconds: 2592000 },
			{ label: 'day', seconds: 86400 },
			{ label: 'hour', seconds: 3600 },
			{ label: 'minute', seconds: 60 },
			{ label: 'second', seconds: 1 },
		];

		for (const { label, seconds: intervalSeconds } of intervals) {
			const interval = Math.floor(seconds / intervalSeconds);
			if (interval > 0) {
				return `${interval} ${label} ago`;
			}
		}
	
		return ('now');
	}

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
						<div className={`notifs-container ${showNotifs ? 'open' : null}`} onClick={() => setShowNotifs(!showNotifs)}>
							<IconNotifs id='icon-notifs'/>
							{unreadNotifs > 0 && (
								<div className="notifs-count">
									{unreadNotifs}
								</div>
							)}
						</div>
					</ul>
					{showNotifs && (
						<div id="notifs-content">
							{notifications
							      .sort((a, b) => b.id - a.id)
								  .map((notification) => (
									<div
										key={notification.id}
										className={`notification-card ${notification.read ? 'read' : 'unread'}`}
									>
										<p>{notification.text}</p>
										{notification.type === "sendFriendRequest" && (
											<div>
												<button onClick={() => handleRequest('acceptFriendRequest', notification.from)}>
													Accept
												</button>
												<button onClick={() => handleRequest('declineFriendRequest', notification.from)}>
													Decline
												</button>
											</div>
										)}
										<p className="notification-date">
											{formatTimeAgo(notification.date)}
										</p>
									</div>
								))}
						</div>
					)}
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