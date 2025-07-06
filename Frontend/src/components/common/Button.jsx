import React from 'react';

const Button = ({
    type,
    name,
    onClick,
    color,
    bgColor,
    borderPx,
    borderColor,
    borderRadius
}) => {
    return (
        <button
            type={type}
            onClick={onClick}
            className="w-full bg-[#0F172A] text-white py-2 rounded-full font-semibold cursor-pointer"
            style={{
                backgroundColor: bgColor,
                color: color,
                borderWidth: borderPx,
                borderColor: borderColor,
                borderRadius: borderRadius
            }}
        >
            {name}
        </button>
    );
};

export default Button;
