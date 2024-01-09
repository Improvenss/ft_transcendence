// CombinedComponent.tsx
import React, { ReactNode, useState } from 'react';

interface CombinedComponentProps {
  content: ReactNode;
  openModalContent: ReactNode;
  buttonClassName: string;
}

const CombinedComponent: React.FC<CombinedComponentProps> = ({
  content,
  openModalContent,
  buttonClassName,
}) => {
  const [isModalOpen, setModalOpen] = useState(false);

  const openModal = () => {
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  return (
    <div>
      <div className={buttonClassName} onClick={openModal}>
        {content}
      </div>
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <span className="close-button" onClick={closeModal}>
              &times;
            </span>
            {openModalContent}
          </div>
        </div>
      )}
    </div>
  );
};

export default CombinedComponent;
	// 	<CombinedComponent
	// 	content={
	// 		<button>Open Modal</button>
	// 	}
	// 	openModalContent={
	// 		<p>This is the content of the modal.</p>
	// 	}
	// 	buttonClassName="open-modal-button"
	// />