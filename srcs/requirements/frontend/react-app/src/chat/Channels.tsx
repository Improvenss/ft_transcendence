import React, { useEffect, useState } from 'react';
import { useSocket } from '../main/SocketHook';

function Channels() {
	const	socket = useSocket();
	const channelList = ['hehe', 'Channel 2', 'Channel 3']; // Kanal listesini istediğiniz şekilde doldurabilirsiniz
	// const channel = 

	const joinChannel = (channel: string) => {
		console.log("joinChannel'e geldi:", channel);
		socket?.emit("joinChannel", channel);
		localStorage.setItem("onChannel", channel);
	}
	
	// useEffect(() => {
	// 	const handleUnload = () => {
	// 	  console.log("Sayfa yenileniyor veya kapatılıyor.");
	// 	  // Yapılması gereken işlemleri buraya ekleyebilirsiniz.
	// 	};
	  
	// 	window.addEventListener("unload", handleUnload);
	  
	// 	return () => {
	// 	  window.removeEventListener("unload", handleUnload);
	// 	};
	//   }, []);
	  


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