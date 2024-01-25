import React, { useState } from 'react';
import Modal from "..//utils/Modal";
import './GamePage.css';
import CreateGame from './CreateGame';
import JoinGame from './JoinGame';
import Matchmaking from './Matchmaking';

interface GameButtonProps {
	content: string;
	onClick: () => void;
}

const GameButton: React.FC<GameButtonProps> = ({ content, onClick }) => (
	<div className="game-button" onClick={onClick} >
		{content}
	</div>
);

const components = {
	Matchmaking: <Matchmaking />,
	JoinGame: <JoinGame />,
	CreateGame: <CreateGame />,
};

const GamePage: React.FC = () => {
	// console.log("---------GAME-PAGE---------");
	const [isModalOpen, setModalOpen] = useState(false);
	const [modalContent, setModalContent] = useState<React.ReactNode | null>(null);

	const openModal = (content: keyof typeof components) => {
		setModalContent(components[content]);
		setModalOpen(true);
	};

	const closeModal = async () => {
		setModalOpen(false);
	};

	return (
		<div id="game-page">
			<GameButton content="Matchmaking" onClick={() => openModal('Matchmaking')}/>
			<GameButton content="Join Game" onClick={() => openModal('JoinGame')} />
			<GameButton content="Create Game" onClick={() => openModal('CreateGame')} />

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