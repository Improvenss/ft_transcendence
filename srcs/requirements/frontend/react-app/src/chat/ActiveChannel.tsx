import React from 'react';
import './ActiveChannel.css';
import { ReactComponent as IconMenu } from '../assets/chat/iconMenu.svg';
import { useEffect, useRef, useState } from 'react';
import { useChannelContext } from './ChatPage';
import { IMessage } from './iChannel';
import { ReactComponent as IconMessage } from '../assets/chat/iconMessage.svg';
import { formatDaytamp, formatTimestamp, isDifferentDay } from '../utils/dateUtils';
import MessageInput from './MessageInput';

function ActiveChannel({userId}:{userId:number}){
	console.log("-->Active Channel<---");
	const {channels, activeChannel, setActiveChannel,channelInfo, setChannelInfo } = useChannelContext();
	const [messages, setMessages] = useState<IMessage[]>([]);
	const messagesEndRef = useRef<HTMLDivElement>(null);

	const handleAdditionalMenuClick = () => { 
		setChannelInfo(!channelInfo); // InfoChannel'ı etkinleştirmek/devre dışı bırakmak için durumu değiştirin
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
			setMessages(activeChannel.messages.sort((a, b) => a.id - b.id));
		}
		const messageInput = document.getElementById("messageTextarea");
		if (messageInput) {
		  messageInput.focus();
		}
	}, [activeChannel]);

	useEffect(() => {
	// Yeni mesaj geldiginde yumusak bir sekilde ekrani mesaja kaydirmak icin.
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
								{(message.author.id !== userId) ? (
									<div className='message taken'>
										{(index === 0 || message.author.id !== messages[index - 1].author.id) ? (
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
										{(index === 0 || message.author.id !== messages[index - 1].author.id) && (
											<span className="icon-span"><IconMessage /></span>
										)}
										<p>{formatMessageContent(message.content)}</p>
										<span className="timestamp">{formatTimestamp(message.sentAt)}</span>
									</div>
								)}
							</React.Fragment>
						))}
						<div ref={messagesEndRef} />
					</div>
					<MessageInput channelId={activeChannel.id} userId={userId} />
				</div>
			)}
		</>
	);
}

export default ActiveChannel;