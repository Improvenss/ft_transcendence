import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { Navigate } from "react-router";
import { useParams } from "react-router-dom";
import { useAuth } from "../hooks/AuthHook";
import { useUser } from "../hooks/UserHook";
import NoMatchPage from "../main/NoMatchPage";
import LoadingPage from "../utils/LoadingPage";
import "./ProfilePage.css";

interface IUserProps{
	email: string;
	login: string;
	displayname: string;
	imageUrl: string;
	socketId?: string;
	nickname?: string;
	avatar?: string;
}

function ProfilePage() {
	const	{ userInfo } = useUser();
	const	isAuth = useAuth().isAuth;
	const	{ username } = useParams(); //profile/akaraca'daki akaraca'yı ele alıyor.
	const	userCookie = Cookies.get("user");
	const	[userPanel, setUserPanel] = useState<IUserProps | undefined | null>(undefined);
	console.log("---------PROFILE-PAGE---------");
	useEffect(() => {
		if (isAuth){
			const checkUser = async () => {
				const response = await fetch(process.env.REACT_APP_FETCH + `/users/user?user=${username}`, {
					method: "GET",
					headers: {
						"Content-Type": "application/json",
						"Authorization": "Bearer " + userCookie as string,
					},
				});
				if (response.ok){
					console.log("---User Profile Backend Connection '✅'---");
					const data = await response.json();
					if (data.message === 'USER OK'){
						console.log("---User Profile Response '✅'---");
						setUserPanel({
							email: data.user.email,
							login: data.user.login,
							displayname: data.user.displayname,
							imageUrl: data.user.imageUrl,
							socketId: data.user.socketId,
							nickname: data.user.nickname,
							avatar: data.user.avatar
						});
						console.log("userInfo:", data.user);
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
	}, [username]);

	if (!isAuth || !userInfo) { //!userInfo sadece userInfo'nun varlığını kesinleştiriyor.
		return (<Navigate to='/login' replace />);
	}

	if ((userPanel === undefined))
		return (<LoadingPage />);

	return (
		<div id="profile-page">
			{userPanel && (
				<>
					<img src={userPanel.imageUrl} alt={`${userPanel.displayname}`} />
					<p>{userPanel.email}</p>
					<p>{userPanel.login}</p>
					<p>{userPanel.displayname}</p>
					<p>{userPanel.nickname}</p>
					<p>{userPanel.avatar}</p>
				</>
			)}
			{!userPanel && (
				<NoMatchPage />
			)}
		</div>
	);
}

export default ProfilePage;
