import { useEffect, useState } from 'react';
import './Leaderboard.css';
import fetchRequest from '../utils/fetchRequest';
import { useUser } from '../hooks/UserHook';

function Leaderboard(){
	console.log("---------LEADERBOARD-PAGE---------");
	const [board, setBoard] = useState();
	const {userInfo} = useUser();

	useEffect(() => {
		const fetchBoard = async () => {
			const response = await fetchRequest({
				method: 'GET',
				url: "/users/leaderboard"
			});
			if (response.ok){
				const data = await response.json();
				console.log("Get Leaderboard: ", data);
				if (!data.err){
					setBoard(data);
				} else {
					console.log("fetchBoard error:", data.err);
				}
			} else {
				console.log("---Backend Connection '❌'---");
			}
		};
		fetchBoard();
	}, []);

	return (
		<div id="leaderboard-page">

		</div>
	)
}

export default Leaderboard;