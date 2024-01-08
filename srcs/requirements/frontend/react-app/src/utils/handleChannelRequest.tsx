import Cookies from "js-cookie";

const handleChannelRequest = async (
	action: string,
	targetUser: string,
	channelName: string,
	channelId: number,
) => {
	const	userCookie = Cookies.get("user");

	if (!channelName)
		return;

	let url = '';
	switch (action) {
		case 'addFriend':
			console.log(`Sending friend request to 'user[${targetUser}]'.`);
			url = `/users/friend/add?user=${targetUser}`;
			break;
		case 'directMessage':
			console.log(action);
			break;
		case 'inviteGame':
			console.log(action);
			break;
		case 'userKick':
			console.log(`User[${targetUser}] kick from channel[${channelName}]`);
			url = `/chat/channel/kick?user=${targetUser}`;
			break;
		case 'userBan':
			console.log(`User[${targetUser}] banned from channel[${channelName}]`);
			url = `/chat/channel/ban?user=${targetUser}`;
			break;
		case 'userUnban':
			console.log(`User[${targetUser}] was unbanned from channel[${channelName}]`);
			url = `/chat/channel/unban?user=${targetUser}`;
			break;
		case 'setAdmin':
			console.log(action);
			break;
		case 'removeAdmin':
			console.log(`Removed User[${targetUser}] administrator permissions from channel[${channelName}]`);
			url = `/chat/channel/admin?action=remove&user=${targetUser}`;
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
				"channel": channelId.toString(),
			},
		});
		if (!response.ok) {
			throw new Error('API-den veri alınamadı.');
		}
		const data = await response.json();
		console.log("handleChannelRequest:", data);
	}
}

export default handleChannelRequest;
