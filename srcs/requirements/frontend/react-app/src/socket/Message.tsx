import React from "react";

function	Message({messages}: {messages: string[]}) {
	return (
		<div>
			{
				messages.map((message, index) => (
					<div key={index}>{index}</div>
				))
			}
		</div>
	);
}

export default	Message;