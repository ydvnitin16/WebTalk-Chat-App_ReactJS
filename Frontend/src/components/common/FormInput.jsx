import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye } from '@fortawesome/free-solid-svg-icons';
import { faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import React, { useEffect, useState } from 'react';

const FormInput = ({
    label,
    type = 'text',
    name,
    register,
    errors,
    placeholder,
    icon,
}) => {
    const [showPassword, setShowPassword] = useState(false);

    let inputType = type === 'password' && showPassword ? 'text' : type;

    useEffect(() => {
        if (showPassword) {
            type = 'text';
        } else {
            type = 'password';
        }
    }, [showPassword]);

    return (
        <div className="mb-4">
            <label className="block text-sm font-semibold mb-1">{label}</label>
            <div className="relative">
                <input
                    type={inputType}
                    placeholder={placeholder}
                    {...register(name)}
                    className={`w-full border-b py-2 pr-10 focus:outline-none ${
                        errors[name] ? 'border-red-500' : 'border-gray-300'
                    }`}
                />
                {type === 'password' ? (
                    <span
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-2 top-2 text-gray-400 cursor-pointer"
                    >
                        {showPassword ? (
                            <FontAwesomeIcon icon={faEyeSlash} />
                        ) : (
                            <FontAwesomeIcon icon={faEye} />
                        )}
                    </span>
                ) : (
                    <span className="absolute right-2 top-2 text-gray-400">
                        {icon}
                    </span>
                )}
            </div>
            {errors[name] && (
                <p className="text-red-500 text-xs mt-1">
                    {errors[name].message}
                </p>
            )}
        </div>
    );
};

export default FormInput;
