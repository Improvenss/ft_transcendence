import fetchRequest from "./fetchRequest";

const handleRequest = async ({action, target, sourceNotifId, gameRoom}:
{action: string, target: string, sourceNotifId?: number, gameRoom?: string}) => {
	console.log(action, target);

	const response = await fetchRequest({
		method: 'POST',
		body: JSON.stringify({
			action: action,
			target: target,
			sourceNotif: (sourceNotifId ? sourceNotifId : undefined),
			gameRoom: (gameRoom ? gameRoom : undefined),
		}),
		url: '/users/request'
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

export default handleRequest;