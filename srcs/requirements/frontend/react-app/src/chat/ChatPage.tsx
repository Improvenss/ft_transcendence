/**
 * LINK: https://socket.io/docs/v4/server-socket-instance/
 */
import { Navigate } from "react-router-dom";
import './ChatPage.css';
import Channels from "./Channels";
import Message from "./Message";
import MessageInput from "./MessageInput";
import { useAuth } from '../login/AuthHook';
import Users from "./Users";

function ChatPage () {
	console.log("---------CHAT-PAGE---------");
	const isAuth = useAuth().isAuth;
	console.log("ChatPage: ", " eskiden buradaydi socket");

	if (!isAuth)
		return (<Navigate to='/login' replace />);

	return (
		<div id="chat-page">
			<Channels />
			<Message />
			<MessageInput />
			<Users />
		</div>
	)
}
export default ChatPage;