import { useState } from 'react';
import "./CreateGame.css";
import Cookies from 'js-cookie';
import { IGameRoom } from './IGame';
import { useNavigate } from 'react-router-dom';

const configs = {
	winningScore: {
		default: 5,
		limited: 1,
	},
	gameDuration: {
		default: 180,
		limited: 30,
	},
};

function CreateGame() {
	console.log("---------CREATE-GAME---------");
	const [roomName, setRoomName] = useState('');
	const [gameMode, setGameMode] = useState('classic');
	// const [map, setMap] = useState('classic');
	const [winningScore, setWinningScore] = useState(configs.winningScore.default);
	const [gameDuration, setGameDuration] = useState(configs.gameDuration.default);
	const [password, setPassword] = useState('');
	const [errorMessage, setErrorMessage] = useState('');
	const userCookie = Cookies.get("user");
	const [description, setDescription] = useState('');
	const navigate = useNavigate();

	const handleCreateRoom = async () => {
		// Oda adı kontrolü
		if (!roomName.trim()) {
			setErrorMessage("Room name can't empty!");
			return;
		}

		if (roomName.length > 20) {
			setErrorMessage('Oda adı en fazla 20 karakter olabilir.');
			return;
		}
	
		// Şifre kontrolü
		if (password.length > 20) {
			setErrorMessage('Şifre en fazla 20 karakter olabilir.');
			return;
		}

		console.log("Room Name:", roomName);
		console.log("Password:", password);
		console.log("Game Mode:", gameMode);
		console.log("Winning Score:", winningScore);
		console.log("Game Duration:", gameDuration);
		console.log("Description:", description);

		const	createRoomObject: IGameRoom = {
			name: roomName,
			password: password === '' ? null : password,
			mode: gameMode,
			winScore: winningScore,
			duration: gameDuration,
			description: description,
		}
		const	response = await fetch(
			process.env.REACT_APP_FETCH + '/game/room', {
				method: 'POST',
				headers: {
					"Content-Type": "application/json",
					"Authorization": "Bearer " + userCookie,
				},
				body: JSON.stringify(createRoomObject),
			}
		);
		const	data = await response.json();
		console.log("responses", data);

		navigate(`/game/lobby/${roomName}`);

		// Başarı durumunda hata mesajını sıfırla
		if (errorMessage != null)
			setErrorMessage('');
	};

  return (
	<div id="create-game">
		<div className="default-section">
			<label htmlFor='room-name'>Room Name:</label>
			<input
				id='room-name'
				type="text"
				value={roomName}
				onChange={(e) => setRoomName(e.target.value.trim())}
				maxLength={15}
			/>

			<label htmlFor='game-mode'>Game Mode:</label>
			<select
				id='game-mode'
				value={gameMode} 
				onChange={(e) => setGameMode(e.target.value)}
			>
				<option value="classic">Classic</option>
				<option value="time_attack">Time Attack</option>
			</select>

			<label htmlFor='winning-score'>Winning Score:</label>
			<select
				id='winning-score'
				value={winningScore === configs.winningScore.default ? 'default' : 'limited'}
				onChange={(e) => setWinningScore(e.target.value === 'default' ? configs.winningScore.default : 1)}
				>
				<option value="default">Default (5 score)</option>
				<option value="limited">Limited</option>
			</select>

			<label htmlFor='game-duration-fixed'>Game Duration:</label>
			<select
				id='game-duration-fixed'
				value={gameDuration === configs.gameDuration.default ? 'default' : 'limited'}
				onChange={(e) => setGameDuration(e.target.value === 'default' ? configs.gameDuration.default : 30)}
				>
				<option value="default">Default (3 minutes)</option>
				<option value="limited">Limited</option>
			</select>

			<label htmlFor='description'>Description (optional):</label>
			<input
				id='description'
				type="text"
				value={description}
				onChange={(e) => setDescription(e.target.value.trim())}
				maxLength={30}
			/>

			<label htmlFor='password'>Password (optional):</label>
			<input
				id='password'
				type="password"
				value={password}
				onChange={(e) => setPassword(e.target.value.trim())}
				maxLength={20}
			/>

			{/* Hata mesajı gösterimi */}
			{errorMessage && <p className="error-message">{errorMessage}</p>}

			<button onClick={handleCreateRoom}>Create Game</button>
		</div>
	   <div className="detail-section">
	   		{winningScore !== configs.winningScore.default && (
				<>
					<label htmlFor='wining-score'>Wining Score :</label>
					<input
						id='wining-score'
						type="number"
						value={winningScore}
						onChange={(e) => {
							const inputValue = e.target.value !== '' ? parseInt(e.target.value, 10) : 1;
							setWinningScore(Math.min(999, Math.max(1, inputValue)));
						}}
					/>
				</>
			)}
			{gameDuration !== configs.gameDuration.default && (
				<>
					<label htmlFor='game-duration'>Game Duration (seconds):</label>
					<input
						id='game-duration'
						type="number"
						value={gameDuration}
						onChange={(e) => {
							const inputValue = e.target.value !== '' ? parseInt(e.target.value, 10) : 1;
							setGameDuration(Math.min(999, Math.max(30, inputValue)))
						}}
					/>
				</>
			)}
		</div>
	</div>
	);
}

export default CreateGame;