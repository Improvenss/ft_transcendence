import fetchRequest from "./fetchRequest";

const handleChannelRequest = async (
	action: string,
	targetId: number,
	channelId: number,
) => {

	console.log(`User[${targetId}] ${action} from channel[${channelId}]`);

	const response = await fetchRequest({
		method: 'POST',
		headers: {
			'channel': channelId.toString()
		},
		url: `/chat/channel/${action}/${targetId}`
	})
	if (response.ok){
		const data = await response.json();
		if (!data.err){
			console.log("handleChannelRequest:", data);
		} else {
			console.log("handleChannelRequest err:", data.err);
		}
	} else {
		console.log("---Backend Connection '❌'---");
	}
}

export default handleChannelRequest;
