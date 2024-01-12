import React, { useEffect } from "react";
import { useRef, useState } from "react";
import { formatDaytamp, formatTimestamp, isDifferentDay } from "../utils/dateUtils";
import { useChannelContext } from "./ChatPage";
import { IMessage } from "./iChannel";
import { ReactComponent as IconMessage } from '../assets/chat/iconMessage.svg';
import { ReactComponent as IconLeave } from '../assets/chat/iconLeave.svg';
import MessageInput from "./MessageInput";
import './ActiveDm.css';
import { useNavigate } from "react-router-dom";
import fetchRequest from "../utils/fetchRequest";

function ActiveDm({userId}:{userId:number}){
	console.log("-->Active DirectMessage<---");
	const { activeDm } = useChannelContext();
	const [messages, setMessages] = useState<IMessage[]>([]);
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const navigate = useNavigate();

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
		if (activeDm){
			setMessages(activeDm.messages.sort((a, b) => a.id - b.id));
		}
		const messageInput = document.getElementById("messageTextarea");
		if (messageInput) {
			messageInput.focus();
		}
	}, [activeDm]);
	
	useEffect(() => {
	// Yeni mesaj geldiginde yumusak bir sekilde ekrani mesaja kaydirmak icin.
		const messagesContainer = document.getElementById("message-container");
		if (messagesContainer)
			messagesContainer.scrollTop = messagesContainer?.scrollHeight;
	}, [messages]);

	const leaveDm = (dmId: number) => {
		fetchRequest({
			method: 'DELETE',
			url: `/chat/dm/leave/${dmId}`
		});
	}


    const otherUser = activeDm?.usersData.find(userData => userData.id !== userId);
    if (!otherUser) {
        return null;
    }

	return (
		<>
		{activeDm && (
			<div id="activeDm">
				<div id="dm-header">
					<img src={otherUser.imageUrl} alt={otherUser.imageUrl} onClick={() => navigate('/profile/' + otherUser.login)}/>
					<h2>{otherUser.login} | {otherUser.displayname}</h2>
					<button onClick={() => leaveDm(activeDm.id)}>
						<IconLeave />
					</button>
				</div>
				<div id="message-container">
					{messages.map((message, index) => (
						<React.Fragment key={index}>
							{index === 0 || isDifferentDay(message.sentAt, messages[index - 1].sentAt) ? (
								<div className="day-sticky">
									<span className="daystamp">{formatDaytamp(message.sentAt)}</span>
								</div>
							) : null}
							<div className={`message ${(message.author.id !== userId) ? 'taken' : 'sent'}`} >
									{(index === 0 || message.author.id !== messages[index - 1].author.id) && (
										<span className="icon-span"><IconMessage /></span>
										)}
									<p>{formatMessageContent(message.content)}</p>
									<span className="timestamp">{formatTimestamp(message.sentAt)}</span>
							</div>
						</React.Fragment>
					))}
					<div ref={messagesEndRef} />
				</div>
				<MessageInput dm={{id: activeDm.id, socketName: "createDm"}} userId={userId}/>
			</div>
		)}
	</>
	)
}

export default ActiveDm;