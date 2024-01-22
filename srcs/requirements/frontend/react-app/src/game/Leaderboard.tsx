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
	console.log("---------LEADERBOARD-PAGE---------");
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
					const fakeBoardData: IBoard[] = [
						{id: 5,login: 'user1',xp: 100,totalWins: 20,totalLoses: 5,totalTies: 3,totalGames: 28},
						{id: 6,login: 'user2',xp: 150,totalWins: 20,totalLoses: 5,totalTies: 3,totalGames: 28},
						{id: 7,login: 'user3',xp: 200,totalWins: 20,totalLoses: 5,totalTies: 3,totalGames: 28},
						{id: 8,login: 'user4',xp: 300,totalWins: 20,totalLoses: 5,totalTies: 3,totalGames: 28},
						{id: 9,login: 'user5',xp: 50,totalWins: 20,totalLoses: 5,totalTies: 3,totalGames: 28},
						{id: 10,login: 'user6',xp: 10,totalWins: 20,totalLoses: 5,totalTies: 3,totalGames: 28},
						{id: 11,login: 'user7',xp: 313,totalWins: 20,totalLoses: 5,totalTies: 3,totalGames: 28},
						{id: 12,login: 'user8',xp: 422,totalWins: 20,totalLoses: 5,totalTies: 3,totalGames: 28},
						{id: 13,login: 'user9',xp: 355,totalWins: 20,totalLoses: 5,totalTies: 3,totalGames: 28},
						{id: 14,login: 'user9',xp: 355,totalWins: 20,totalLoses: 5,totalTies: 3,totalGames: 28},
						{id: 15,login: 'user9',xp: 355,totalWins: 20,totalLoses: 5,totalTies: 3,totalGames: 28},
						{id: 16,login: 'user9',xp: 355,totalWins: 20,totalLoses: 5,totalTies: 3,totalGames: 28},
						{id: 17,login: 'user9',xp: 355,totalWins: 20,totalLoses: 5,totalTies: 3,totalGames: 28},
						{id: 18,login: 'user9',xp: 355,totalWins: 20,totalLoses: 5,totalTies: 3,totalGames: 28},
						{id: 19,login: 'user9',xp: 355,totalWins: 20,totalLoses: 5,totalTies: 3,totalGames: 28},
						{id: 20,login: 'user9',xp: 355,totalWins: 20,totalLoses: 5,totalTies: 3,totalGames: 28},

					]
				
					setBoard(prevBoard => [...prevBoard, ...fakeBoardData, ...responseData.data as IBoard[]]);
					// setBoard(responseData.data as IBoard[]); //sadece bu açılacak şimdilik yorum satırında kalsın.
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