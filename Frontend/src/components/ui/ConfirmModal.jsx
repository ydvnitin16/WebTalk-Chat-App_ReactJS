import { Delete, Trash, X } from "lucide-react";
import React from "react";
import Button from "./Button";

const ConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    actionTitle,
}) => {
    if (!isOpen) return null;

    return (
        <div className='fixed inset-0 z-[1000] flex items-center justify-center p-4 overflow-auto'>
            <div className='fixed inset-0 bg-black/50 backdrop-blur-sm'></div>

            <div className='relative w-full max-w-md bg-white dark:bg-zinc-900 text-gray-900 dark:text-white shadow-lg rounded-lg p-6 z-10'>
                <div className='text-center my-8'>
                    <h4 className='text-lg font-semibold mt-4'>{title}</h4>
                    {description && (
                        <p className='text-sm text-slate-600 mt-4 dark:text-gray-400'>
                            {description}
                        </p>
                    )}
                </div>

                {/* Buttons */}
                <div className='flex flex-col space-y-3'>
                    <Button onClick={onConfirm} variant='destructive'>
                        {actionTitle}
                    </Button>
                    <Button onClick={onClose} variant='secondary'>
                        Close
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
