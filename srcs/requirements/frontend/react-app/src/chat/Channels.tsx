import React from 'react';

const Channels = () => {
	const channelList = ['Channel 1', 'Channel 2', 'Channel 3']; // Kanal listesini istediğiniz şekilde doldurabilirsiniz

	return (
		<div style={{ width: '200px', borderRight: '1px solid white' }}> 
			<ul>
				{channelList.map(channel => (
					<li key={channel}>{channel}</li>
				))}
			</ul>
		</div>
	);
};

export default Channels;

// import React, { useEffect } from 'react';
// import { Link, Route, Routes } from 'react-router-dom';
// import { Channel } from '../'

// const Channels = ({ channels, joinChannel }: { channels: Channel[], joinChannel: (id: string) => void }) => {
// 	return (
// 	  <div style={{ width: '200px', borderRight: '1px solid white' }}>
// 		<ul>
// 		  {channels.map((channel) => (
// 			<li key={channel.id}>
// 			  <Link to={`/channels/${channel.id}`} onClick={() => joinChannel(channel.id)}>
// 				{channel.name}
// 			  </Link>
// 			</li>
// 		  ))}
// 		</ul>
// 	  </div>
// 	);
//   };
  

// export default Channels;
