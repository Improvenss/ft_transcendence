import { useEffect } from "react";
import { useSocket } from "../hooks/SocketHook";
import { useNavigate } from "react-router-dom";

// function	generateUniqueRoomName(length: number) {
// 	const randomNumber = Math.random().toString(36).substring(2, length + 2);
// 	return (randomNumber);
// }

	// const	matchmaking = async (status: boolean) => {
	// 	const	response = await fetchRequest({
	// 		method: 'PUT',
	// 		body: JSON.stringify({
	// 			status: status,
	// 		}),
	// 		url: '/game/matchmaking',
	// 	});
	// 	if (response.ok){
	// 		const data = await response.json();
	// 		console.log("GamePage Matchmaking:", data);
	// 		if (!data.err && data.roomName){
	// 			navigate(`/game/${data.roomName}`, {replace: true});
	// 		} else {
	// 			console.log("GamePage Matchmaking:", data);
	// 		}
	// 	} else {
	// 		console.log("---Backend Connection '❌'---");
	// 	}
	// }
	

function Matchmaking(){
	const {socket} = useSocket();
	const navigate = useNavigate();

	useEffect(() => {
		socket.emit('matchmaking', { status: true });
		socket.on('matchmakingStartGame', (roomName: string) => {
			navigate(`/game/${roomName}`, { replace: true });
		});
		return () => {
			socket.off('matchmakingStartGame');
			socket.emit('matchmaking', { status: false });
		};
	}, []);

	return(
		<>
			Searching available game. . .
		</>
	);
}

export default Matchmaking;