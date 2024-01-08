import fetchRequest from "./fetchRequest";

const handleRequest = async (action: string, targetUser: string, notifId?: number) => {
	console.log(action,targetUser);
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
		const response = await fetchRequest({
			method: 'POST',
			url: url,
		});
		if (response.ok){
			const data = await response.json();
			if (!data.err){
				console.log("handleRequest:", data);
			} else {
				console.log("handleRequest err:", data.err);
			}
		} else {
			console.log("---Backend Connection '❌'---");
		}
	}
}

export default handleRequest;
