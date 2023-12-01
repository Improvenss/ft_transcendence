/**
 * LINK: https://socket.io/docs/v4/server-socket-instance/
 */
import { Navigate } from "react-router-dom";
import './ChatPage.css';
import { useAuth } from "../hooks/AuthHook";
import Channel from "./Channel";
import OnChannel from "./OnChannel";
import { useState } from "react";
import { IChannel } from './iChannel';
import InfoChannel from "./InfoChannel";
import Cookies from "js-cookie";

// Buradan alinan veri ya full buradaki gibi olacak. ya da buradaki gibi veriye donusturulecek.
// Ama DB'yi full buradan gonderilen verilere gore tekrar yap...
async function getChannels(): Promise<any> {
	const userCookie = Cookies.get("user");
	const	responseAllChannels = await fetch(process.env.REACT_APP_FETCH + "/chat/@all/all", {
		method: 'POST', // ya da 'POST', 'PUT', 'DELETE' gibi isteğinize uygun HTTP metodunu seçin
		headers: {
			'Content-Type': 'application/json', // İstediğiniz içerik türüne göre uygun başlık ekleyin
			// Diğer isteğe bağlı başlıkları eklemek istiyorsanız burada ekleyebilirsiniz
		},
		// Eğer bir request body kullanmanız gerekiyorsa, aşağıdaki kısmı açabilir ve gerekli bilgileri ekleyebilirsiniz
		body: JSON.stringify({userCookie}),
	});
	const	data = await responseAllChannels.json();
	console.log("ALDIGIMIZ channel json data:", data);
	// return (data);
	return (data);
}

function ChatPage () {
	console.log("---------CHAT-PAGE---------");
	const isAuth = useAuth().isAuth;
	
	const [channels, setChannels] = useState<IChannel[]>(() => {
		// Kanal listesini burada güncelleyin (örneğin, bir API'den kanal verilerini alabilirsiniz)
		const	dataChannels = getChannels();
		const fetchedChannels: IChannel[] = [
			{ status: 'involved', name: 'Global Channel', type: 'involved', image: '/global.png',
				users: [{name: 'akaraca', image: '/userImg.png'}, {name: 'damnn', image: '/userImg2.png'}],
				chat: [
					{sender: 'akaraca', content: 'Hello!', timestamp: Date.now()},
					{sender: 'damnn', content: 'Hi there!', timestamp: Date.now() + 10000},
					{sender: 'uercan', content: 'Hi bitches!', timestamp: Date.now() + 15000},
					{sender: 'uercan', content: 'I am come back!', timestamp: Date.now() + 16000},
					{sender: 'gsever', content: 'it is a dog? Thats look weird!', timestamp: Date.now() + 21000},
					{sender: 'akaraca', content: 'u r too!', timestamp: Date.now() + 25000}
				]
			},
	
			// Diğer kanallar...
			]; // Örnek kanal listesi
			return (fetchedChannels)
	});

	const [selectedChannel, setSelectedChannel] = useState<IChannel | null>(() => {
		const globalChannel = channels.find(channel => channel.status === 'involved' && channel.name === 'Global Channel');
		if (globalChannel === undefined)
			return (null);
			// {status: 'involved', name: 'Global Channel', type: 'involved', image: 'img3' };
		return (globalChannel);
	});

	const [isInfoChannelActive, setIsInfoChannelActive] = useState(false);

	if (!isAuth)
		return (<Navigate to='/login' replace />);

	return (
		<div id="chat-page">
			<Channel setSelectedChannel={setSelectedChannel} channels={channels} />
			<OnChannel selectedChannel={selectedChannel} isInfoChannelActive={isInfoChannelActive} setIsInfoChannelActive={setIsInfoChannelActive}/>
			<InfoChannel selectedChannel={selectedChannel} isInfoChannelActive={isInfoChannelActive} setIsInfoChannelActive={setIsInfoChannelActive}/>
			{/* <Channels /> */}
			{/* <Message /> */}
			{/* <MessageInput /> */}
			{/* <Users /> */}
		</div>
	)
}
export default ChatPage;