import './ActiveChannel.css';
//import { IOnChannelProps } from './iChannel';
import { ReactComponent as IconMenu } from '../assets/chat/iconMenu.svg';
import { useEffect, useRef, useState } from 'react';
import { useChannelContext } from './ChatPage';
import { IMessage } from './iChannel';
import { useSocket } from '../hooks/SocketHook';
import { useUser } from '../hooks/UserHook';
import { ReactComponent as IconMessage } from '../assets/chat/iconMessage.svg';
import React from 'react';

function ActiveChannel(){
	const { activeChannel, channelInfo, setChannelInfo } = useChannelContext();
	const MAX_CHARACTERS = 1000; // İstenilen maksimum karakter sayısı
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

	const formatDaytamp = (timestamp: number) => {
		const messageDate = new Date(timestamp);
		const currentDate = new Date();
		
		// Set both dates to midnight to ignore the time component
		currentDate.setHours(0, 0, 0, 0);
		messageDate.setHours(0, 0, 0, 0);
	  
		const diffInDays = Math.floor((currentDate.getTime() - messageDate.getTime()) / (24 * 60 * 60 * 1000));
	  
		const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
	  
		if (diffInDays === 0) {
		  return 'Bugün';
		} else if (diffInDays === 1) {
		  return 'Dün';
		} else if (diffInDays >= 2 && diffInDays <= 6) {
		  return days[messageDate.getDay()];
		} else {
		  // For older dates, you can customize the format as needed
		  return `${messageDate.getDate()}.${messageDate.getMonth() + 1}.${messageDate.getFullYear()}`;
		}
	  };
	  
	  function isDifferentDay(timestamp1: number, timestamp2: number) {
		const date1 = new Date(timestamp1);
		const date2 = new Date(timestamp2);
		return date1.toDateString() !== date2.toDateString();
	  }

	function formatTimestamp(timestamp: number) {
		const date = new Date(timestamp);
		const hours = date.getHours();
		const minutes = date.getMinutes();

		const formattedTime = `${addLeadingZero(hours)}:${addLeadingZero(minutes)}`;
		return formattedTime;
	}

	const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		// Kullanıcının daha fazla karakter girmesini engelle
		if (e.target.value.length <= MAX_CHARACTERS) {
			setMessageInput(e.target.value);
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		// Eğer basılan tuş Enter ise ve karakter sayısı sınırı aşılmamışsa
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			handleSendMessage(); // Send butonunu çalıştır
		}
	};
  
	const handleSendMessage = () => {
		if (messageInput.length > 0 && messageInput.length <= MAX_CHARACTERS) {
			// Mesajı gönderme işlemini gerçekleştir
			socket?.emit("createMessage", {
				channel: activeChannel,
				author: author,
				content: messageInput
			});
			console.log(`Message sent: ${messageInput}`);
			setMessageInput('');
		}
		// Implement logic to send the message
		// You may want to send the message through the socket or your messaging system
	};

	function formatMessageContent(content: string) {
		// Mesaj içeriğindeki '\n' karakterini <br> tag'ine dönüştür
		return content.split('\n').map((line, index) => (
		  <React.Fragment key={index}>
			{line}
			{index < content.length - 1 && <br />}
		  </React.Fragment>
		));
	  }

	useEffect(() => {
		if (activeChannel){
			setMessages(activeChannel.messages);
		}
		const messageInput = document.getElementById("messageTextarea");
		if (messageInput) {
		  messageInput.focus();
		}
	}, [activeChannel]);

	useEffect(() => {
		const handleListenMessage = (newMessage: IMessage) => {
			console.log("Message Recived:", newMessage);
			setMessages(prevMessages => [
				...prevMessages,
				newMessage
			]);
		}

		socket?.on(`listenChannelMessage:${activeChannel?.name}`, handleListenMessage);
		return () => {
			socket?.off(`listenChannelMessage:${activeChannel?.name}`, handleListenMessage);
		};
	}, [activeChannel, socket]);

	useEffect(() => {
		// Yeni mesaj geldiginde yumusak bir sekilde ekrani mesaja kaydirmak icin.
		// messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
		const messagesContainer = document.getElementById("message-container");
		if (messagesContainer)
  			messagesContainer.scrollTop = messagesContainer?.scrollHeight;
	}, [messages]);

	return (
		<>
			{activeChannel && (
				<div id="activeChannel">
						<div id="channel-header">
							<img src={activeChannel.image} alt={activeChannel.image} />
							<h2>{activeChannel.name}</h2>
							{activeChannel.description && (
								<>
									<h2>|</h2>
									<h2>{activeChannel.description}</h2>
								</>
							)}
							<div id="additional-menu-trigger" onClick={handleAdditionalMenuClick}>
								<IconMenu />
							</div>
						</div>
						<div id="message-container">
							{messages.map((message, index) => (
								<React.Fragment key={index}>
									{index === 0 || isDifferentDay(message.sentAt, messages[index - 1].sentAt) ? (
										<div className="day-sticky">
											<span className="daystamp">{formatDaytamp(message.sentAt)}</span>
										</div>
									) : null}
								<div key={index} className={`message-content`}>
									{(message.author.login !== author?.login) ? (
										<div className='message taken'>
											{(index === 0 || message.author.login !== messages[index - 1].author.login) ? (
												<>
													<img src={message.author.imageUrl} alt={message.author.imageUrl} className="user-image" />
													<div className='first-message'>
														<span className="icon-span"><IconMessage /></span>
														<span className='username'>{message.author.login}</span>
														<p>{formatMessageContent(message.content)}</p>
														<span className="timestamp">{formatTimestamp(message.sentAt)}</span>
													</div>
												</>
											):(
												<div className='last-message'>
													<p>{formatMessageContent(message.content)}</p>
													<span className="timestamp">{formatTimestamp(message.sentAt)}</span>
												</div>
											)}
										</div>
									) : (
										<div className='message sent'>
											{(index === 0 || message.author.login !== messages[index - 1].author.login) && (
												<span className="icon-span"><IconMessage /></span>
											)}
											<p>{formatMessageContent(message.content)}</p>
											<span className="timestamp">{formatTimestamp(message.sentAt)}</span>
										</div>
									)}
								</div>
								</React.Fragment>
							))}
							<div ref={messagesEndRef} />
						</div>
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
				</div>
			)}
		</>
	);
}

export default ActiveChannel;