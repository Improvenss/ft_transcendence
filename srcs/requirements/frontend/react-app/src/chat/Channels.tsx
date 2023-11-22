import React from 'react';
import { useSocket } from '../main/SocketHook';

function Channels() {
	const	socket = useSocket();
	const channelList = ['Channel 1', 'Channel 2', 'Channel 3']; // Kanal listesini istediğiniz şekilde doldurabilirsiniz

	const joinChannel = (channel: string) => {
		console.log("joinChannel'e geldi:", channel);
		socket?.emit("joinChannel", channel);
	}

	return (
		<div id='channel-page'>
			<ul>
				{channelList.map(channel => (
					<li key={channel} onClick={() => joinChannel(channel)}>{channel}</li>
				))}
			{/* <button onClick={() => joinChannel("hehe")}> Tikla "hehe" kanalina katil</button> */}
			</ul>
		</div>
	);
};

export default Channels;