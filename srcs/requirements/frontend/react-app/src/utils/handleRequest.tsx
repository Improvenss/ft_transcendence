import Cookies from "js-cookie";

const handleRequest = async (action: string, targetUser: string) => {
	console.log(action);
	const	userCookie = Cookies.get("user");
	let url = '';
	switch (action){
		case 'addFriend':
			url = `/users?action=sendFriendRequest&target=${targetUser}`;
			break;
		case 'poke':
			url = `/users?action=poke&target=${targetUser}`;
			break;
		case 'acceptFriendRequest':
			break;
		case 'declineFriendRequest':
			break;
		case 'inviteGame':
			break;
		default:
			break;
	}

	if (url){
		const response = await fetch(process.env.REACT_APP_FETCH + url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				"Authorization": "Bearer " + userCookie,
			},
		});
		if (!response.ok) {
			throw new Error('API-den veri alınamadı.');
		}
		const data = await response.json();
		console.log("handleRequest:", data);
	}
}

export default handleRequest;
