import React, { useState } from 'react';
import Modal from "..//utils/Modal";
import './GamePage.css';
import CreateGame from './CreateGame';
import JoinGame from './JoinGame';
import Matchmaking from './Matchmaking';
import { Navigate, useNavigate } from "react-router-dom";
import { useSocket } from "../hooks/SocketHook";
import {useUser} from "../hooks/UserHook";
import { IGameRoom } from './IGame';
import fetchRequest from '../utils/fetchRequest';

interface GameButtonProps {
	content: string;
	onClick: () => void;
}

const GameButton: React.FC<GameButtonProps> = ({ content, onClick }) => (
	<div className="game-button" onClick={onClick}>
		{content}
	</div>
);

const GamePage: React.FC = () => {
	console.log("---------GAME-PAGE---------");
	const [isModalOpen, setModalOpen] = useState(false);
	const [modalContent, setModalContent] = useState<React.ReactNode | null>(null);
	const [isModalMatching, setModalMatching] = useState(false);

	const user = useUser();
	const {socket} = useSocket();
	const navigate = useNavigate();

	const openModal = (content: React.ReactNode) => {
		setModalContent(content);
		setModalOpen(true);
	};

	function generateUniqueRoomName(length: number) {
		const randomNumber = Math.random().toString(36).substring(2, length + 2);
		return (randomNumber);
	}

	const closeModal = async () => {
		setModalOpen(false);
		if (isModalMatching)
		{
			const roomName = generateUniqueRoomName(5) + user.userInfo.login;
			const response = await fetchRequest({
				method: 'DELETE',
				url: `/game/room/${roomName}`,
			});
			if (response.ok) {
				const data = await response.json();
				if (!data.err) {
					console.log("Room deleted successfully");
				} else {
					console.log("Error deleting room:", data.err);
				}
			}
			else
			{
				console.log("Respose failed");
			}
			console.log("stopped searching");
			socket?.emit('stopSearchGame', user.userInfo.login);
			setModalMatching(false);
		}
	};

	// /game/lobby/test
	socket?.on('matching', (data) => {
		navigate(`/game/lobby/${data.name}`);
	})

	const findMatch = async () => {
		const	createRoomObject: IGameRoom = {
			name: generateUniqueRoomName(5) + user.userInfo.login,
			password: null,
			mode: 'classic',
			// mode: 0,
			winScore: 5,
			duration: 180,
			description: '',
			invitedPlayer: null,
			type: 'public'
		}
		console.log("Searching Match . . .");
		const response = await fetchRequest({
			method: 'POST',
			body: JSON.stringify(createRoomObject),
			url: '/game/room'
		});
		if (response.ok){
			const data = await response.json();
			console.log("responses", data);
			if (!data.err){
				socket?.emit('searchGame', {login: user.userInfo.login, data: data.name});
			} else {
				navigate('/404');
			}
		} else {
			console.log("Response failed on searching game");
		}
	}

	return (
		<div id="game-page">
			{/* <GameButton content="Matchmaking" onClick={() => openModal(<Matchmaking />)} /> */}
			<GameButton content="Matchmaking" onClick={() => {setModalMatching(true); findMatch(); openModal(<Matchmaking />); }} />
			<GameButton content="Join Game" onClick={() => openModal(<JoinGame />)} />
			<GameButton content="Create Game" onClick={() => openModal(<CreateGame />)} />

			<Modal
				isOpen={isModalOpen}
				onClose={closeModal}
				mouse={true}
				overlayClassName='game-overlay'
				modalClassName='game-modal'
				closeButtonClassName='game-close-button'
			>
				{modalContent}
			</Modal>
		</div>
	);
};

export default GamePage;