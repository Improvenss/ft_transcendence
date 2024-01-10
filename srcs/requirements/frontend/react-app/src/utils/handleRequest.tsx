import fetchRequest from "./fetchRequest";

const handleRequest = async (action: string, targetUser: string, notifId?: number) => {
	console.log(action,targetUser);

	const response = await fetchRequest({
		method: 'POST',
		url: `/users/${action}/${targetUser}?notifID=${notifId ? notifId : 0}`,
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