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
