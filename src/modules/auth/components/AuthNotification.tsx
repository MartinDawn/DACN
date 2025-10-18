import React from 'react';
import { HiCheckCircle, HiXCircle } from 'react-icons/hi2';

interface NotificationProps {
  message: string;
  type: 'success' | 'error';
  onClose?: () => void;
  show: boolean;
}

export const AuthNotification: React.FC<NotificationProps> = ({ message, type, onClose, show }) => {
  if (!show) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-fade-in">
      <div className={`rounded-lg p-4 flex items-center gap-3 shadow-lg ${
        type === 'success' 
          ? 'bg-green-50 text-green-800 border border-green-200' 
          : 'bg-red-50 text-red-800 border border-red-200'
      }`}>
        <div className="flex-shrink-0">
          {type === 'success' ? (
            <HiCheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <HiXCircle className="h-5 w-5 text-red-500" />
          )}
        </div>
        <div className="flex-1 text-sm font-medium">
          {message}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className={`flex-shrink-0 rounded-md p-1.5 inline-flex hover:bg-opacity-20 ${
              type === 'success' ? 'hover:bg-green-500' : 'hover:bg-red-500'
            }`}
          >
            <span className="sr-only">Đóng</span>
            <svg
              className={`h-4 w-4 ${type === 'success' ? 'text-green-600' : 'text-red-600'}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};