import './ActiveChannel.css';
//import { IOnChannelProps } from './iChannel';
import { ReactComponent as IconMenu } from '../assets/chat/iconMenu.svg';
import { useEffect, useRef, useState } from 'react';
import { useChannelContext } from './ChatPage';
import { IMessage } from './iChannel';
import { useSocket } from '../hooks/SocketHook';
import { useUser } from '../hooks/UserHook';

function ActiveChannel(){
	const { activeChannel, channelInfo, setChannelInfo } = useChannelContext();
	const MAX_CHARACTERS = 100; // İstenilen maksimum karakter sayısı
	const [messageInput, setMessageInput] = useState('');
	const [messages, setMessages] = useState<IMessage[]>([]);
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const socket = useSocket();
	const author = useUser().userInfo;

	const handleAdditionalMenuClick = () => {
		setChannelInfo(!channelInfo); // Toggle the state to activate/deactivate infoChannel
	};

	function addLeadingZero(number: number) {
		return number < 10 ? `0${number}` : number;
	}

	function formatTimestamp(timestamp: number) {
		const date = new Date(timestamp);
		const hours = date.getHours();
		const minutes = date.getMinutes();
		const seconds = date.getSeconds();

		const formattedTime = `${addLeadingZero(hours)}:${addLeadingZero(minutes)}:${addLeadingZero(seconds)}`;
		return formattedTime;
	}

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		// Kullanıcının daha fazla karakter girmesini engelle
		if (e.target.value.length <= MAX_CHARACTERS) {
			setMessageInput(e.target.value);
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		// Eğer basılan tuş Enter ise ve karakter sayısı sınırı aşılmamışsa
		if (e.key === 'Enter') {
			handleSendMessage(); // Send butonunu çalıştır
		}
	};
  
	const handleSendMessage = () => {
		if (messageInput.length > 0 && messageInput.length <= MAX_CHARACTERS) {
			// Mesajı gönderme işlemini gerçekleştir
			socket?.emit("createMessage", {
				channel: activeChannel,
				author: author,
				message: messageInput
			});
			console.log(`Message sent: ${messageInput}`);
			setMessageInput('');
		}
		// Implement logic to send the message
		// You may want to send the message through the socket or your messaging system
	};

	useEffect(() => {
		if (activeChannel){
			setMessages(activeChannel.messages);
		}
	}, [activeChannel]);

	useEffect(() => {
		const handleListenMessage = (newMessage: IMessage) => {
			console.log("MEssage Geldi:", newMessage);
			setMessages(prevMessages => [
				...prevMessages,
				newMessage
			]);
		}

		socket?.on('listenChannelMessage', handleListenMessage);
		return () => {
			socket?.off('listenChannelMessage', handleListenMessage);
		};
	}, [socket]);

	useEffect(() => {
		// Yeni mesaj geldiginde yumusak bir sekilde ekrani mesaja kaydirmak icin.
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	return (
		<>
			{activeChannel && (
				<div id="activeChannel">
						<div id="channel-header">
							<img src={activeChannel.image} alt={activeChannel.image} />
							<h2>{activeChannel.name}</h2>
							<div id="additional-menu-trigger" onClick={handleAdditionalMenuClick}>
								<IconMenu />
							</div>
						</div>
						<div id="message-container">
							{messages.map((message, index) => (
								<div key={index} className="message">
									<img src={message.sender.imageUrl} alt={message.sender.imageUrl} className="user-image" />
									<div className="message-content">
									<strong>{message.sender.login}:</strong> {message.content}
										<div className="timestamp">{formatTimestamp(message.timestamp)}</div>
									</div>
								</div>
							))}
							<div ref={messagesEndRef} />
						</div>
						<div id="message-input">
							<input
								type="text"
								value={messageInput}
								onChange={handleInputChange}
								onKeyDown={handleKeyDown}
								placeholder="Type your message"
							/>
							<div id="char-count">{messageInput.length}/{MAX_CHARACTERS}</div>
							<button onClick={handleSendMessage}>Send</button>
						</div>
				</div>
			)}
		</>
	);
}

export default ActiveChannel;