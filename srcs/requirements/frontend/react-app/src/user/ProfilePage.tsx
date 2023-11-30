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
			<img src={userInfo.image} alt={`${userInfo.first_name} ${userInfo.last_name}`} />
			<p>{userInfo.first_name} {userInfo.last_name}</p>
			<p>{userInfo.email}</p>
		</div>
	);
}

export default ProfilePage;
