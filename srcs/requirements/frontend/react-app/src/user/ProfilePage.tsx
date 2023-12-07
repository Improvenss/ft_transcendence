import { Navigate } from "react-router";
import { useAuth } from "../hooks/AuthHook";
import { useUser } from "../hooks/UserHook";
import "./ProfilePage.css";

function ProfilePage() {
	const	{ userInfo } = useUser();
	const	isAuth = useAuth().isAuth;

	if (!isAuth || !userInfo) { //!userInfo sadece userInfo'nun varlığını kesinleştiriyor.
		return (<Navigate to='/login' replace />);
	}

	return (
		<div id="profile-page">
			<img src={userInfo.imageUrl} alt={`${userInfo.displayname}`} />
			<p>{userInfo.email}</p>
			<p>{userInfo.login}</p>
			<p>{userInfo.displayname}</p>
			<p>{userInfo.nickname}</p>
			<p>{userInfo.avatar}</p>
		</div>
	);
}

export default ProfilePage;
