import Cookies from "js-cookie";

const handleRequest = async (action: string, targetUser: string, notifId?: number) => {
	console.log(action,targetUser);
	const	userCookie = Cookies.get("user");
	let url = '';
	switch (action){
		case 'poke':
			url = `/users?action=${action}&target=${targetUser}`;
			break;
		case 'sendFriendRequest':
			url = `/users?action=${action}&target=${targetUser}`;
			break;
		case 'acceptFriendRequest':
			url = `/users?action=${action}&target=${targetUser}&id=${notifId}`;
			break;
		case 'declineFriendRequest':
			url = `/users?action=${action}&target=${targetUser}&id=${notifId}`;
			break;
		case 'inviteGame':
			break;
		default:
			console.error("Invalid action:", action);
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
