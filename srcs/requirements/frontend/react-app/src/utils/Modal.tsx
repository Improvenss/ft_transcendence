import React, { ReactNode, useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  mouse?: boolean;
  overlayClassName?: string;
  modalClassName?: string;
  closeButtonClassName?: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, mouse = true, overlayClassName, modalClassName, closeButtonClassName }) => {
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (mouse && isOpen && event.target instanceof Element && !event.target.closest(`.${modalClassName}`)) {
        onClose();
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (isOpen && event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEscapeKey);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose, mouse, modalClassName]);

  if (!isOpen) return null;

  return (
    <div className={`modal-overlay ${overlayClassName}`}>
      <div className={`modal ${modalClassName}`}>
        <span className={`close-button ${closeButtonClassName}`} onClick={onClose}>&times;</span>
        {children}
      </div>
    </div>
  );
}

export default Modal;
