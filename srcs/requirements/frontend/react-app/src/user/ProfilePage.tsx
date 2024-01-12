import { useEffect, useState } from "react";
import { Navigate } from "react-router";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../hooks/AuthHook";
import { useUser } from "../hooks/UserHook";
import NoMatchPage from "../main/NoMatchPage";
import LoadingPage from "../utils/LoadingPage";
import "./ProfilePage.css";
import handleRequest from '../utils/handleRequest'
import fetchRequest from "../utils/fetchRequest";
import { IUserProps } from "../chat/iChannel";

function ProfilePage() {
	console.log("---------PROFILE-PAGE---------");
	const	{ userInfo } = useUser();
	const	isAuth = useAuth().isAuth;
	const	{ username } = useParams(); //profile/akaraca'daki akaraca'yı ele alıyor.
	const	[userPanel, setUserPanel] = useState<IUserProps | undefined | null>(undefined);
	const	[friendSearchTerm, setFriendSearchTerm] = useState('');
	const	navigate = useNavigate();
	const	[qrCodeImageUrl, setQrCodeImageUrl] = useState('');
	const	[qrCode, setQrCode] = useState('');

	const handle2FA = async (userLogin: string) => {
		try {
			const response = await fetchRequest({
				method: "POST",
				url: `/users/set/2fa`,
			});
			const data = await response.json();
			// QR kodunu al
			console.log("qrcode", data.qrCode);
			setQrCodeImageUrl(data.qrCode);
		} catch (err) {
			console.error("Error setting up 2FA:", err);
			return (err);
		}
	}

	const handleVerify2FA = async (sixDigitCode: string) => {
		try {
			const response = await fetchRequest({
				method: "POST",
				url: `/users/verify/2fa/${sixDigitCode}`,
			});
			const data = await response.json();
			console.log("Is verified???? ->>>>", data);
		} catch (err) {
			console.error("Error verifying 2FA:", err);
			return (err);
		}
	}

	const handleMessage = async (userId: number) => {
		//--> 1. backend'de mesajı gönderene özel kanal oluşturulacak. alan kişide olmayacak.
		//--> 2. backend'den fend'e socket bilgisi gitcek, kanala focuslan diye
		//--> 3. chat'e yönlendir 
		//--> 4. gönderen mesajı yazana kadar, alan kişide kanal gözükmeyecek
		//--> 5. kanal tek taraflı silinecek
		//--> info yapısı yok, sadece leave channel olacak.

		navigate('/chat');
		const response = await fetchRequest({
			method: 'POST',
			url: `/chat/dm/${userId}`
		});
	}

	useEffect(() => {
		if (isAuth){
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
		}
		/* eslint-disable react-hooks/exhaustive-deps */
	}, [username]);

	if (!isAuth || !userInfo) { //!userInfo sadece userInfo'nun varlığını kesinleştiriyor.
		return (<Navigate to='/login' replace />);
	}

	if ((userPanel === undefined))
		return (<LoadingPage />);

/*
	-> game history - oynanılan oyun sayısı - kazanılan oyun sayısı - kaybedilen oyun sayısı - xp bar
	-> achivment bar
	-> arkadaşlıktan çıkarma,
	-> DM gönderme
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
					{ userPanel.login === userInfo.login ? (
 							<div id="friends">
 								<input
 									id="friendSearch"
 									type="text"
 									value={friendSearchTerm}
 									onChange={(e) => setFriendSearchTerm(e.target.value)}
 									placeholder="Search friends..."
 								/>
								<button id="2fa" onClick={() => handle2FA(userInfo.login)}>Set 2FA</button>
								<img id="qrCodeImage" src={qrCodeImageUrl} alt="QR Code" />
								<input
									id="verify2fa"
									type="text"
									value={qrCode}
									onChange={(e) => setQrCode(e.target.value)}
									placeholder="Write 6 digit code."
								/>
								<button id="verify2fa" onClick={() => handleVerify2FA(qrCode)}>Send 6 Digit Code</button>
 								{userPanel.friends && userPanel.friends
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
								<button id="poke" onClick={() => handleRequest('poke', userPanel.login)}>Poke</button>
								<button id="addFriend" onClick={() => handleRequest('sendFriendRequest', userPanel.login)}>Add Friend</button>
								<button id="sendMessage" onClick={() => handleMessage(userPanel.id)} >Send Message</button>
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