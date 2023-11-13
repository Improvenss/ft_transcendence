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