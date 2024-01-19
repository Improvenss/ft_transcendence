import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useUser } from "../hooks/UserHook";
import NoMatchPage from "../utils/NoMatchPage";
import LoadingPage from "../utils/LoadingPage";
import "./ProfilePage.css";
import handleRequest from '../utils/handleRequest'
import fetchRequest from "../utils/fetchRequest";
import { IUserProps } from "../chat/iChannel";

function ProfilePage() {
	console.log("---------PROFILE-PAGE---------");
	const	{ userInfo } = useUser();
	const	{ username } = useParams(); //profile/akaraca'daki akaraca'yı ele alıyor.
	const	[userPanel, setUserPanel] = useState<IUserProps | undefined | null>(undefined);
	const	[friendSearchTerm, setFriendSearchTerm] = useState('');
	const	navigate = useNavigate();

	const handleSendMessage = async (userId: number) => {
		navigate('/chat');
		fetchRequest({
			method: 'POST',
			url: `/chat/dm/${userId}`
		});
	}

	useEffect(() => {
		const checkUser = async () => {
			const	response = await fetchRequest({
				method: 'GET',
				url: `/users/user?who=${username}`,
			});
			if (response.ok){
				console.log("---User Profile Backend Connection '✅'---");
				const data = await response.json();
				console.log("ProfilePage:", data);
				if (!data.err){
					console.log("---User Profile Response '✅'---");
					setUserPanel(data);
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
		/* eslint-disable react-hooks/exhaustive-deps */
	}, [username]); //kendi profilime tıkladığımda single-page olduğundan dolayı sayfa güncellenmiyor


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

	if ((userPanel === undefined)){
		return (<LoadingPage />);
	}

	if (!userPanel){
		return (<NoMatchPage />);
	}

	return (
		<div id="profile-page">
			<div id="user">
				<div id="user-image">
					<img id="intraImg" src={userPanel.imageUrl} alt={`${userPanel.displayname}`} />
					{userPanel.avatar && (
						<img id="avatarImg" src={userPanel.avatar} alt={`${userPanel.avatar}`} />
					)}
					<div className={`status-indicator status-${userPanel.status.toLowerCase()}`}></div>
				</div>
				<p>Login Name {userPanel.nickname ? "- Nickname:": ":"}</p>
				<span>{userPanel.login} {userPanel.nickname ? "- " + userPanel.nickname : ""}</span> 
				<p>Real Name:</p>
				<span>{userPanel.displayname}</span>
				<p>Email:</p>
				<span>{userPanel.email}</span>
				{ userPanel.login === userInfo.login ? (
					<div id="friends">
						<input
							id="friendSearch"
							type="text"
							value={friendSearchTerm}
							onChange={(e) => setFriendSearchTerm(e.target.value)}
							placeholder="Search friends..."
						/>
						{userPanel.friends && userPanel.friends
							.filter((user) => user.login.toLowerCase().includes(friendSearchTerm.toLowerCase()))
							.map((user) => (
								<div
									key={user.login}
									id='friend-users'
									onClick={() => navigate('/profile/' + user.login)}
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
						<button id="poke" onClick={() => handleRequest('poke', userPanel.login)}>Poke</button>
						<button id="sendMessage" onClick={() => handleSendMessage(userPanel.id)} >Send Message</button>
						{!(userInfo.friends.some((user) => user.id === userPanel.id)) ? (
							<button id="addFriend" onClick={() => handleRequest('sendFriendRequest', userPanel.login)}>Add Friend</button>
						):(
							<button id="unFriend" onClick={() => handleRequest('unFriend', userPanel.login)}>Remove Friend</button>
						)}
						{!(userInfo.blockUsers.some((user) => user.id === userPanel.id)) ? (
							<button id="block" onClick={() => handleRequest('block', userPanel.login)} >Block</button>
						):(
							<button id="unblock" onClick={() => handleRequest('unblock', userPanel.login)} >Unblock</button>
						)}
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
					<div className="xp-bar">
						<div className="xp" style={{ width: `${"75"}%` }} />
						<div className="level" >55 lv </div>
						<div className="rate">(%75)</div>
					</div>
					<div id="achievements-container">
						{userPanel.achivments.map((achievement, index) => (
							<div key={index} className="achievement">
								<img className="icon" src={require('../assets/achivment/' + achievement.icon)} alt={achievement.icon}/>
								<div className="progress-bar">
									<div className="progress" style={{ width: `${achievement.progress}%` }}></div>
								</div>
								<div className="title">{achievement.name}</div>
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
	);
}

export default ProfilePage;