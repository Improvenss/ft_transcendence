import { useEffect } from 'react';
import { useSocket } from '../main/SocketHook';
import { Socket } from 'socket.io-client';

function joinChannel(channel: string, socket: Socket | null) {
	if (socket === null)
		throw ("Error: Socket: null");
	socket?.emit("joinChannel", channel);
	localStorage.setItem("onChannel", channel);
	// if (channel === "global")
	// 	localStorage.setItem("isChannelGlobal", "TRUE");
	// else
	// 	localStorage.setItem("isChannelGlobal", "FALSE");
}

function Channels() {
	const	socket = useSocket();
	const	channelList = ['hehe', 'Channel 2', 'Channel 3']; // Kanal listesini istediğiniz şekilde doldurabilirsiniz

	console.log("kac kere calisti channels");

	// firstPageLogin
	useEffect(() => {
		// Burada channels her yenilendiginde calismasini istiyoruz.
		// <React.StrictMode>'yi kapattim bu yuzden 1 kere calisiyor. Yoksa 2 kere calisiyor.
		const	lastChannel = localStorage.getItem("onChannel");
		// if (lastChannel !== "global") {
			console.log(`Sayfa yenilendi ve '${lastChannel}' channel'inden otomatik olarak 'global' channeline katilindi.`);
			joinChannel("global", socket);
		// }
	}, [])

	return (
		<div id='channel-page'>
			<ul>
				{channelList.map(channel => (
					<li key={channel}
					onClick={
						() => joinChannel(channel, socket)
					}>{channel}</li>
				))}
			</ul>
		</div>
	);
};

export default Channels;