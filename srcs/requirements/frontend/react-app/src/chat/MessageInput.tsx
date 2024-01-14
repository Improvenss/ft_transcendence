import { useState } from "react";
import { useSocket } from "../hooks/SocketHook";

const MAX_CHARACTERS = 1000; // İstenilen maksimum karakter sayısı

const MessageInput: React.FC<{
	channel?: { id: number; socketName: string };
	dm?: { id: number; socketName: string };
	userId: number
}> = ({
	channel, dm, userId
}) => {

	const [messageInput, setMessageInput] = useState('');
	const {socket} = useSocket();

	const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
	// Kullanıcının daha fazla karakter girmesini engelle
		if (e.target.value.length <= MAX_CHARACTERS) {
			setMessageInput(e.target.value);
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
	// Eğer basılan tuş Enter ise
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			handleSendMessage(); // Send butonunu çalıştır
		}
	};
	
	const handleSendMessage = () => {
	// Mesajı gönderme işlemini gerçekleştir
		if (messageInput.length > 0 && messageInput.length <= MAX_CHARACTERS) {
			if (socket) {
				socket.emit(`${channel ? channel.socketName : dm?.socketName}`,{
					...(channel && {channel: channel.id}),
					...(dm && {dm: dm.id}),
					author: userId,
					content: messageInput
				});
				console.log(`Message sent: ${messageInput}`);
				setMessageInput('');
			}
		}
	};

	return (
		<div id="message-input">
			<textarea
				id='messageTextarea' //uyarı verdiği için ekledim.
				value={messageInput}
				onChange={handleInputChange}
				onKeyDown={handleKeyDown}
				placeholder="Type your message"
			/>
			<div id="char-count">{messageInput.length}/{MAX_CHARACTERS}</div>
			<button onClick={handleSendMessage}>Send</button>
		</div>
	);
}

export default MessageInput;