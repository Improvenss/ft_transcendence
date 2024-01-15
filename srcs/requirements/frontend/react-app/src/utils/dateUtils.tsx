export const formatDaytamp = (timestamp: number) => {
	const messageDate = new Date(timestamp);
	const currentDate = new Date();

	// Zaman bileşenini yok saymak için her iki tarihi de gece yarısına ayarlayın
	messageDate.setHours(0, 0, 0, 0);
	currentDate.setHours(0, 0, 0, 0);

	const diffInDays = Math.floor((currentDate.getTime() - messageDate.getTime()) / (24 * 60 * 60 * 1000));
	const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
	if (diffInDays === 0) {
		return 'Today';
	} else if (diffInDays === 1) {
		return 'Yesterday';
	} else if (diffInDays >= 2 && diffInDays <= 6) {
		return days[messageDate.getDay()];
	} else {
		return `${messageDate.getDate()}.${messageDate.getMonth() + 1}.${messageDate.getFullYear()}`;
	}
};
  
export function isDifferentDay(timestamp1: number, timestamp2: number) {
	const date1 = new Date(timestamp1);
	const date2 = new Date(timestamp2);
	return date1.toDateString() !== date2.toDateString();
}

function addLeadingZero(number: number) {
	return number < 10 ? `0${number}` : number;
}

export function formatTimestamp(timestamp: number) {
	const date = new Date(timestamp);
	const hours = date.getHours();
	const minutes = date.getMinutes();

	const formattedTime = `${addLeadingZero(hours)}:${addLeadingZero(minutes)}`;
	return formattedTime;
}