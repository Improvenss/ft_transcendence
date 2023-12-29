import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { Navigate } from "react-router";
import { useParams } from "react-router-dom";
import { useAuth } from "../hooks/AuthHook";
import { useUser } from "../hooks/UserHook";
import NoMatchPage from "../main/NoMatchPage";
import LoadingPage from "../utils/LoadingPage";
import "./ProfilePage.css";
import handleRequest from '../utils/handleRequest'

interface IUserProps{
	email: string;
	login: string;
	displayname: string;
	imageUrl: string;
	socketId?: string;
	nickname?: string;
	avatar?: string;
	status: string;
	friends: IUserProps[];
}

function ProfilePage() {
	console.log("---------PROFILE-PAGE---------");
	const	{ userInfo } = useUser();
	const	isAuth = useAuth().isAuth;
	const	{ username } = useParams(); //profile/akaraca'daki akaraca'yı ele alıyor.
	const	userCookie = Cookies.get("user");
	const	[userPanel, setUserPanel] = useState<IUserProps | undefined | null>(undefined);
	const	[friendSearchTerm, setFriendSearchTerm] = useState('');

	useEffect(() => {
		if (isAuth){
			const checkUser = async () => {
				const response = await fetch(process.env.REACT_APP_FETCH + `/users/user?user=${username}&relations=friends`, {
					method: "GET",
					headers: {
						"Content-Type": "application/json",
						"Authorization": "Bearer " + userCookie as string,
					},
				});
				if (response.ok){
					console.log("---User Profile Backend Connection '✅'---");
					const dataUser = await response.json();
					if (dataUser.message === 'USER OK'){
						console.log("---User Profile Response '✅'---");
						setUserPanel({
							email: dataUser.user.email,
							login: dataUser.user.login,
							displayname: dataUser.user.displayname,
							imageUrl: dataUser.user.imageUrl,
							socketId: dataUser.user.socketId,
							nickname: dataUser.user.nickname,
							avatar: dataUser.user.avatar,
							status: dataUser.user.status,
							friends: dataUser.user.friends,
						});
						console.log("userInfo:", dataUser);
					} else {
						console.log("---User Profile Response '❌'---");
						setUserPanel(null);
					}
				} else {
					console.log("---User Profile Backend Connection '❌'---");
					setUserPanel(null);
				}
			}
			checkUser();
		}
		/* eslint-disable react-hooks/exhaustive-deps */
	}, [username]);

	if (!isAuth || !userInfo) { //!userInfo sadece userInfo'nun varlığını kesinleştiriyor.
		return (<Navigate to='/login' replace />);
	}

	if ((userPanel === undefined))
		return (<LoadingPage />);

	/*
			kullanıcı login - nickname - image - avatar - displayname - email
			game history - oynanılan oyun sayısı - kazanılan oyun sayısı - kaybedilen oyun sayısı - xp bar
			achivment bar
			frinedlist - arkadaş olarak ekleme - çıkarma,
			DM gönderme
			kullanıcı statü durumu -> online - offline - oyunda
		*/

		const getRandomDate = () => {
			const date = new Date(+(new Date()) - Math.floor(Math.random() * 10000000000));
			return date.toISOString().split('T')[0];
		  };
		
		  // Rastgele oyun, rakip ve durum bilgileri
		  const historyData = Array.from({ length: 20 }, (_, index) => ({
			date: getRandomDate(),
			game: `Game ${index + 1}`,
			rival: `Rival ${index + 1}`,
			status: Math.random() < 0.5 ? 'Win' : 'Lose',
		  }));
		
		  const achievements = [
			{ icon: '🎮', title: 'Game Master', progress: 50 },
			{ icon: '🔧', title: 'Mechanic', progress: 75 },
			{ icon: '🏆', title: 'Champion', progress: 80 },
			{ icon: '🎖️', title: 'Veteran', progress: 65 },
			{ icon: '🚀', title: 'Explorer', progress: 90 },
			{ icon: '🌟', title: 'Superstar', progress: 30 },
			{ icon: '🏅', title: 'Pro Gamer', progress: 55 },

			{ icon: '🎮', title: 'Game Master', progress: 50 },
			{ icon: '🔧', title: 'Mechanic', progress: 75 },
			{ icon: '🏆', title: 'Champion', progress: 80 },
			{ icon: '🎖️', title: 'Veteran', progress: 65 },
			{ icon: '🚀', title: 'Explorer', progress: 90 },
			{ icon: '🌟', title: 'Superstar', progress: 30 },
			{ icon: '🏅', title: 'Pro Gamer', progress: 55 },
			];

	return (
		<>
		{userPanel && (
			<div id="profile-page">
				<div id="user">
					<div id="user-image">
						<img id="intraImg" src={userPanel.imageUrl} alt={`${userPanel.displayname}`} />
						<img id="avatarImg" src={userPanel.avatar} alt={`${userPanel.avatar}`} />
						<div className={`status-indicator status-${userPanel.status.toLowerCase()}`}></div>
					</div>
					<p>Login Name {userPanel.nickname ? "- Nickname:": ":"}</p>
					<span>{userPanel.login} {userPanel.nickname ? "- " + userPanel.nickname : ""}</span> 
					<div className="xp-bar">
						<div className="xp" style={{ width: `${"75"}%` }} />
						<div className="level" >55</div>
					</div>
					<p>Real Name:</p>
					<span>{userPanel.displayname}</span>
					<p>Email:</p>
					<span>{userPanel.email}</span>
					<button id="poke" onClick={() => handleRequest('poke', userPanel.login)}>Poke</button>
					{ userPanel.login === userInfo.login ? (
 							<div id="friends">
 								<input
 									id="friendSearch"
 									type="text"
 									value={friendSearchTerm}
 									onChange={(e) => setFriendSearchTerm(e.target.value)}
 									placeholder="Search friends..."
 								/>
 								{userPanel.friends
 									.filter((user) => user.login.toLowerCase().includes(friendSearchTerm.toLowerCase()))
 									.map((user) => (
 										<div
 											key={user.login}
 											id='friend-users'
 										>
 											<img src={user.imageUrl} alt={user.imageUrl} />
 											<div id='friend-users-table'>
 												<span>{user.login}</span>
 												<span>Status: {user.status}</span>
 											</div>
 										</div>
 									)
								)}
 							</div>
 						) : (
							<>
								<button id="addFriend" onClick={() => handleRequest('sendFriendRequest', userPanel.login)}>Add Friend</button>
								<button id="sendMessage">Send Message</button>
							</>
						)}
				</div>
				<div id="user-board">
					<div id="user-info">
						<div id="gameStatus">
							<div id="Total">Total 10</div>
							<div id="Win">Win 5</div>
							<div id="Lose">Lose 5</div>
							<div id="Rate">Rate 50%</div>
						</div>
						<div id="achievements-container">
							{achievements.map((achievement, index) => (
								<div key={index} className="achievement">
								<div className="icon">{achievement.icon}</div>
								<div className="title">{achievement.title}</div>
								<div className="progress-bar">
									<div className="progress" style={{ width: `${achievement.progress}%` }}></div>
								</div>
								</div>
							))}
						</div>
					</div>
					<div id="history-container">
						<div id="history-bar">
							<p>Date</p>
							<p>Game</p>
							<p>Rival</p>
							<p>Status</p>
						</div>
						{historyData.map((item, index) => (
						<div key={index} className="history-item">
							<p>{item.date}</p>
							<p>{item.game}</p>
							<p>{item.rival}</p>
							<p>{item.status}</p>
						</div>
						))}
					</div>
				</div>
			</div>
		)}
		{!userPanel && (
			<NoMatchPage />
		)}
		</>
	);
}

export default ProfilePage;