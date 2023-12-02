import { useEffect } from 'react';
import { useSocket } from '../../hooks/SocketHook';
import { Socket } from 'socket.io-client';

/**
 * Buradaki yapi tipi ayni backend'deki 'CreateChannelDto' tipi.
 */
interface WebSocketChannelData {
	channel: string;
	name: string;
	type: string;
	password: string | "none";
}

function joinChannel(channel: string, socket: Socket | null) {
	if (socket === null)
		throw (new Error("Error: Socket: null"));
	const sendData: WebSocketChannelData = {
		channel: channel,
		name: "Example Name",
		type: "public",
		password: "none",
		// Buraya cookie'de tuttugumuz login ismini verirsek Channel olusumunda admini User entity'si olarak atayabiliriz.
	};
	socket?.emit("joinChannel", sendData);
	localStorage.setItem("onChannel", channel);
}

function leaveChannel(channel: string, socket: Socket | null) {
	if (socket === null)
		throw (new Error("Error: Socket: null"));
	const sendData = {
		channel: channel,
		// name: "Example Name",
		// type: "public",
		// password: "none",
		// Buraya cookie'de tuttugumuz login ismini verirsek Channel olusumunda admini User entity'si olarak atayabiliriz.
	};
	socket?.emit("leaveChannel", sendData);
	localStorage.setItem("onChannel", "none");
}

function Channels() {
	const	socket = useSocket();
	const	channelList = ['hehe', 'Channel 2', 'Channel 3']; // Kanal listesini istediğiniz şekilde doldurabilirsiniz

	// firstPageLogin
	useEffect(() => {
		// Burada channels her yenilendiginde calismasini istiyoruz.
		// <React.StrictMode>'yi kapattim bu yuzden 1 kere calisiyor. Yoksa 2 kere calisiyor.
		const	lastChannel = localStorage.getItem("onChannel");
		// if (lastChannel !== "global") {
			console.log(`Sayfa yenilendi ve '${lastChannel}' channel'inden otomatik olarak 'global' channeline katilindi.`);
			// joinChannel("global", socket);
		// }
	}, [socket])

	return (
		<div id='channel-page'>
			{/* <ul>
				{channelList.map(channel => (
					<li key={channel}
					onClick={
						() => joinChannel(channel, socket)
					}>{channel}<button onClick={(e) => { e.stopPropagation(); leaveChannel(channel, socket); }}>Leave</button> </li>
				))}
			</ul> */}
		</div>
	);
};

export default Channels;