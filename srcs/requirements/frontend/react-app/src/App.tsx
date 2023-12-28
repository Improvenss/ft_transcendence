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

interface INotifs {
	id: number,
	type: 'text' | 'sendFriendRequest',
	text: string,
	date: Date,
	read: boolean,
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

		//user için bildirim yapısı oluşturulacak, okunan ve okunmayan bildirim yapısı olacak.
		//Kullanıcı bilgilerinin yanında bu bildirim mesajlarıda gelecek ve info'da listelenecek.
		//Eğer yeni bir bildiri gelirse socket'ten kullanıcı adına notifs:user-name'e mesaj atılacak.
		//	Frontend'de ise bu dinleme olayı gerçekleşecek.


		// bildirim için useEffect kullanılacak, burada socket dinlemesi gerçekleştirilmelidir,
		//		Kullanıcıya, arkadaşlık isteği, oyun isteği gibi istekleri ve diğer bildirimleri listeleteceğiz.
		//		Bu yapılar, buton içerikli, text içerikli olacak.

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
						<div id="notifs-container">
							<IconNotifs id='notifs' onClick={() => setShowNotifs(!showNotifs)} />
							{unreadNotifs > 0 && (
								<div className="notification-count">
									{unreadNotifs}
								</div>
							)}
						</div>
					</ul>
					{showNotifs && (
						<div className="notifs-content">
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
												<button onClick={() => console.log("accept")}>
													Accept
												</button>
												<button onClick={() => console.log("decline")}>
													Decline
												</button>
											</div>
										)}
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