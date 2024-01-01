import { useEffect, useState } from 'react';
import { INotif, useUser } from './hooks/UserHook';
import { useAuth } from './hooks/AuthHook';
import { useSocket } from './hooks/SocketHook';
import { ReactComponent as IconNotifs } from './assets/iconNotification.svg';
import handleRequest from './utils/handleRequest';
import Modal from "./utils/Modal";
import './Notification.css';

function Notification() {
	console.log("---------NOTIFICATION---------");
	const { isAuth, setAuth } = useAuth();
	const socket = useSocket();
	const { userInfo } = useUser();
	const [unreadNotifs, setUnreadNotifs] = useState<number>(0);
	const [notifications, setNotifications] = useState<INotif[]>([]);
	const [isModalOpen, setModalOpen] = useState(false);

	useEffect(() => {
		if (isAuth && userInfo && socket){
			setNotifications(userInfo.notifications);
			setUnreadNotifs(userInfo.notifications.filter((notif: INotif) => !notif.read).length);

			const handleListenNotifs = (newNotif: INotif) => {
				console.log("Notif Geldi:", newNotif);
				setNotifications(prevNotifs => [
					...prevNotifs,
					newNotif
				]);

				if (!newNotif.read) {
					setUnreadNotifs(prevCount => prevCount + 1);
				}

				const notifsContainer = document.getElementById("notifs-content");
				if (notifsContainer){
					notifsContainer.scrollTop = 0;
				}
			}

			socket.on(`notif:${userInfo.login}`, handleListenNotifs);
			return () => {
				socket.off(`notif:${userInfo.login}`, handleListenNotifs);
			};
		}
	}, []);

	useEffect(() => {
		if (isAuth){
			if (isModalOpen && unreadNotifs > 0){
				setUnreadNotifs(0);
				socket?.emit('markAllNotifsAsRead');
			}
		}
	}, [isModalOpen]);

	const formatTimeAgo = (dateString: string) => {
		const	now = new Date();
		const	date = new Date(dateString);
		const	seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

		const intervals = [
			{ label: 'year', seconds: 31536000 },
			{ label: 'month', seconds: 2592000 },
			{ label: 'day', seconds: 86400 },
			{ label: 'hour', seconds: 3600 },
			{ label: 'minute', seconds: 60 },
			{ label: 'second', seconds: 1 },
		];

		for (const { label, seconds: intervalSeconds } of intervals) {
			const interval = Math.floor(seconds / intervalSeconds);
			if (interval > 0) {
				return `${interval} ${label} ago`;
			}
		}
	
		return ('now');
	}

	return (
		<div id="notification">
			
			<div className={`notifs-container ${isModalOpen ? 'open' : null}`} onClick={() => setModalOpen(!isModalOpen)}>
				<IconNotifs id='icon-notifs'/>
				{unreadNotifs > 0 && (
					<div className="notifs-count">
						{unreadNotifs}
					</div>
				)}
			</div>

			<Modal
				isOpen={isModalOpen}
				onClose={() => setModalOpen(false)}
				mouse={true}
				overlayClassName='notif-overlay'
				modalClassName='notif-modal'
				closeButtonClassName='notif-close-button'
			>
				<div id="notifs-content">
					{notifications
						.sort((a, b) => b.id - a.id)
						.map((notification) => (
						<div
							key={notification.id}
							className={`notification-card ${notification.read ? 'read' : 'unread'}`}
						>
							<p>{notification.text}</p>
							{notification.type === "sendFriendRequest" && (
								<div>
									<button onClick={() => handleRequest('acceptFriendRequest', notification.from, notification.id)}>
										Accept
									</button>
									<button onClick={() => handleRequest('declineFriendRequest', notification.from, notification.id)}>
										Decline
									</button>
								</div>
							)}
							<p className="notification-date">
								{formatTimeAgo(notification.date)}
							</p>
						</div>
					))}
				</div>
			</Modal>
		</div>
	);
}

export default Notification;
