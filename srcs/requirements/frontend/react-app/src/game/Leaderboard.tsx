import { useEffect, useState } from 'react';
import './Leaderboard.css';
import fetchRequest from '../utils/fetchRequest';
import { useUser } from '../hooks/UserHook';
import { useNavigate } from 'react-router-dom';

interface IBoard {
	id: number,
	login: string,
	xp: number,
	totalWins: number,
	totalLoses: number,
	totalTies: number,
	totalGames: number,
}

function Leaderboard(){
	// console.log("---------LEADERBOARD-PAGE---------");
	const [board, setBoard] = useState<IBoard[]>([]);
	const {userInfo} = useUser();
	const navigate = useNavigate();

	useEffect(() => {
		const fetchBoard = async () => {
			const response = await fetchRequest({
				method: 'GET',
				url: "/users/leaderboard"
			});
			if (response.ok){
				const responseData: { success: boolean, data?: IBoard[], err?: string } = await response.json();
				// const data = await response.json();
				console.log("Get Leaderboard: ", responseData);
				if (!responseData.err){
					setBoard(responseData.data as IBoard[]);
				} else {
					console.log("fetchBoard error:", responseData.err);
				}
			} else {
				console.log("---Backend Connection '❌'---");
			}
		};
		fetchBoard();
	}, []);

	return (
		<div id="leaderboard-page">
		<table>
			<thead>
				<tr>
					<th>Rank</th>
					<th>Login</th>
					<th>XP</th>
					<th>Total Wins</th>
					<th>Total Loses</th>
					<th>Total Ties</th>
					<th>Total Games</th>
				</tr>
			</thead>
			<tbody>
				{board.sort((a, b) => b.xp - a.xp).map((user, index) => (
					<tr key={index} className={user.login === userInfo.login ? 'highlight' : ''} onClick={() => navigate('/profile/' + user.login)}>
						<td>{index + 1}</td>
						<td>{user.login}</td>
						<td>{user.xp}</td>
						<td>{user.totalWins}</td>
						<td>{user.totalLoses}</td>
						<td>{user.totalTies}</td>
						<td>{user.totalGames}</td>
					</tr>
				))}
			</tbody>
		</table>
		</div>
	)
}

export default Leaderboard;