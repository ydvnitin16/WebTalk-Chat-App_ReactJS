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
    <div className="fixed inset-0 z-[1001] flex items-center justify-center p-4 overflow-auto">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-[0.5px]"></div>

      <div className="relative w-full max-w-md bg-white/30 backdrop-blur-[4px] dark:bg-[#151515]/30 shadow-inner dark:shadow-zinc-800 shadow-zinc-400 border-zinc-300 text-gray-900 dark:text-white rounded-4xl p-6 z-10 border dark:border-zinc-800">
        <div className="text-center my-8">
          <h4 className="text-lg font-semibold mt-4">{title}</h4>
          {description && (
            <p className="text-sm text-slate-600 mt-4 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex flex-col space-y-3">
          <Button onClick={onConfirm} variant="destructive">
            {actionTitle}
          </Button>
          <Button onClick={onClose} variant="secondary">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
