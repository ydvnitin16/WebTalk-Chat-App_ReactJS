import React, { useEffect } from "react";
import { X } from "lucide-react";
import { optimizeUrl } from "@/utils/imageOptimization";

const AvatarScreen = ({ isOpen, onClose, src }) => {
    if (!isOpen || !src) return null;

    return (
        <div
            className='fixed inset-0 z-[100] bg-black/90 flex items-center justify-center backdrop-blur-[2px]'
            onClick={onClose}
        >
            <button
                onClick={onClose}
                className='absolute top-5 right-5 text-white hover:text-gray-300'
            >
                <X size={28} />
            </button>

            <img
                loading='lazy'
                src={optimizeUrl(src, "large")}
                alt='avatar'
                onClick={(e) => e.stopPropagation()}
                className='max-w-[90%] max-h-[90%] object-contain rounded-lg shadow-lg'
            />
        </div>
    );
};

export default AvatarScreen;
