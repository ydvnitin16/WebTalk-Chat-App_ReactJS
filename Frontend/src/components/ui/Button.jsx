import clsx from "clsx";
import { twMerge } from "tailwind-merge";

const variants = {
    primary: "bg-zinc-900 text-white hover:bg-zinc-800",
    secondary: "bg-zinc-100 text-zinc-900 hover:bg-zinc-200",
    ghost: "bg-transparent hover:bg-zinc-100",
    destructive: "bg-red-600 text-white hover:bg-red-500",
};

const sizes = {
    sm: "h-8 px-3 text-xs",
    md: "h-9 px-4 text-sm",
    lg: "h-10 px-6 text-sm",
};

const Button = ({
    variant = "primary",
    size = "md",
    className,
    disabled = false,
    loading = false,
    children,
    ...props
}) => {
    return (
        <button
            className={twMerge(
                clsx(
                    "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition",
                    "focus:outline-none focus:ring-2 focus:ring-zinc-900",
                    "disabled:opacity-60 disabled:pointer-events-none",
                    variants[variant],
                    sizes[size],
                    className,
                ),
            )}
            disabled={disabled || loading}
            {...props}
        >
            {loading && (
                <span className='h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
            )}
            {children}
        </button>
    );
};

export default Button;
