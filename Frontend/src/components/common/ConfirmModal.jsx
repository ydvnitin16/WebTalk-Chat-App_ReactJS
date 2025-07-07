import React from 'react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, description }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 overflow-auto">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm"></div>

      <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 text-gray-900 dark:text-white shadow-lg rounded-lg p-6 z-10">
        {/* Close Icon */}
        <svg
          onClick={onClose}
          xmlns="http://www.w3.org/2000/svg"
          className="w-4 h-4 cursor-pointer fill-gray-400 hover:fill-red-500 absolute top-4 right-4"
          viewBox="0 0 320.591 320.591"
        >
          <path d="M30.391 318.583a30.37 30.37 0 0 1-21.56-7.288c-11.774-11.844-11.774-30.973 0-42.817L266.643 10.665c12.246-11.459 31.462-10.822 42.921 1.424 10.362 11.074 10.966 28.095 1.414 39.875L51.647 311.295a30.366 30.366 0 0 1-21.256 7.288z" />
          <path d="M287.9 318.583a30.37 30.37 0 0 1-21.257-8.806L8.83 51.963C-2.078 39.225-.595 20.055 12.143 9.146c11.369-9.736 28.136-9.736 39.504 0l259.331 257.813c12.243 11.462 12.876 30.679 1.414 42.922-.456.487-.927.958-1.414 1.414a30.368 30.368 0 0 1-23.078 7.288z" />
        </svg>

        {/* Icon + Content */}
        <div className="text-center my-8">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-14 h-14 fill-red-500 inline"
            viewBox="0 0 24 24"
          >
            <path d="M19 7a1 1 0 0 0-1 1v11.191A1.92 1.92 0 0 1 15.99 21H8.01A1.92 1.92 0 0 1 6 19.191V8a1 1 0 0 0-2 0v11.191A3.918 3.918 0 0 0 8.01 23h7.98A3.918 3.918 0 0 0 20 19.191V8a1 1 0 0 0-1-1Zm1-3h-4V2a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v2H4a1 1 0 0 0 0 2h16a1 1 0 0 0 0-2ZM10 4V3h4v1Z" />
            <path d="M11 17v-7a1 1 0 0 0-2 0v7a1 1 0 0 0 2 0Zm4 0v-7a1 1 0 0 0-2 0v7a1 1 0 0 0 2 0Z" />
          </svg>

          <h4 className="text-lg font-semibold mt-4">{title}</h4>
          {description && (
            <p className="text-sm text-slate-600 mt-4 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex flex-col space-y-3">
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg text-white text-sm font-medium bg-red-500 hover:bg-red-600 cursor-pointer"
          >
            Yes, Logout
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-200 text-slate-900 hover:bg-gray-300 cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
