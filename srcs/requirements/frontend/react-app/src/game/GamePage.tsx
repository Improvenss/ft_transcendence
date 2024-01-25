import React, { useEffect, useState } from 'react';
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
	// console.log("---------GAME-PAGE---------");
	const [isModalOpen, setModalOpen] = useState(false);
	const [modalContent, setModalContent] = useState<React.ReactNode | null>(null);
	const [isModalMatching, setModalMatching] = useState(false);

	const user = useUser();
	const {socket} = useSocket();
	const navigate = useNavigate();

	function	generateUniqueRoomName(length: number) {
		const randomNumber = Math.random().toString(36).substring(2, length + 2);
		return (randomNumber);
	}

	const openModal = (content: React.ReactNode) => {
		setModalContent(content);
		setModalOpen(true);
	};

	useEffect(() => {

		socket.on('matchmakingStartGame', (roomName: string) => {
			navigate(`/game/${roomName}`, {replace: true});
		});
		return () => {
			socket.off('matchmakingStartGame');
		};
	})

	const	matchmaking = async (status: boolean) => {
		// socket.emit('fastMatch');
		const	response = await fetchRequest({
			method: 'PUT',
			body: JSON.stringify({
				status: status,
			}),
			url: '/game/matchmaking',
		});
		if (response.ok){
			const data = await response.json();
			console.log("GamePage Matchmaking:", data);
			if (!data.err && data.roomName){
				navigate(`/game/${data.roomName}`, {replace: true});
			} else {
				console.log("GamePage Matchmaking:", data);
			}
		} else {
			console.log("---Backend Connection '❌'---");
		}
	}


	const closeModal = async () => {
		setModalOpen(false);
		if (isModalMatching)
		{
			console.log("kapandi ustammmmmmm");
			matchmaking(false);
			setModalMatching(false);
		}
	};

	return (
		<div id="game-page">
			{/* <GameButton content="Matchmaking" onClick={() => openModal(<Matchmaking />)} /> */}
			<GameButton content="Matchmaking" onClick={() => {setModalMatching(true); matchmaking(true); openModal(<Matchmaking />); }} />
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