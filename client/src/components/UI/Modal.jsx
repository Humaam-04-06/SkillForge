import React, { useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { Card } from './Card';

export const Modal = ({
  isOpen,
  onClose,
  title = '',
  children,
  size = 'md',
  className = ''
}) => {
  // Prevent body scrolling when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Container */}
      <div className={`relative w-full ${sizes[size]} transform transition-all duration-300 z-10 scale-100`}>
        <Card
          className={`overflow-hidden border border-darkBorder ${className}`}
          bodyClassName="p-6 text-textPrimary"
          title={title}
          action={
            <button 
              onClick={onClose}
              className="text-textSecondary hover:text-textPrimary transition-colors p-1"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          }
        >
          {children}
        </Card>
      </div>
    </div>
  );
};

export default Modal;
