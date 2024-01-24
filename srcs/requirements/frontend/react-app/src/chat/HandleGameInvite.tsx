import { ReactNode, useState } from "react";
import Modal from "../utils/Modal";
import CreateGame from "../game/CreateGame";

interface GameInviteProps {
	login: string;
	children?: ReactNode;
  }

function GameInvite({login, children }: GameInviteProps){
	const [isModalOpen, setModalOpen] = useState(false);

	return (
		<>
			<button
				className={`invite-container ${isModalOpen ? 'open' : null}`}
				onClick={() => setModalOpen(!isModalOpen)}
				>
				{children}
			</button>

			<Modal
				isOpen={isModalOpen}
				onClose={() => setModalOpen(false)}
				mouse={true}
				overlayClassName='game-overlay'
				modalClassName='game-modal'
				closeButtonClassName='game-close-button'
			>
				<CreateGame invite={login}/>
			</Modal>
		</>
	)
}

export default GameInvite;
