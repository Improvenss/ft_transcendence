// import React from "react";

// function Message({recvMessage}: {recvMessage: string[]}) {
// 	return (
// 		<div>
// 			{
// 				recvMessage.map((msgData, index) => (
// 					<div key={index}>{index}</div>
// 				))
// 			}
// 		</div>
// 	);
// }

// export default Message;

import React from "react";

function	Message({messages}: {messages: string[]}) {
	return (
		<div>
			{
				messages.map((message, index) => (
					<div key={index}>{index}: {message}</div>
				))
			}
		</div>
	);
}

export default	Message;