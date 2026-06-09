import React from "react";

export function Button({ children, onClick, type = "button", variant = "primary", disabled = false, className = "", ...props }) {
    const baseStyle = "px-5 py-3 rounded-2xl font-semibold text-sm uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300";
    
    const variants = {
        primary: "bg-zinc-950 hover:bg-[#c9a96e] text-white hover:text-zinc-950 dark:bg-zinc-800 dark:hover:bg-[#c9a96e]",
        secondary: "bg-zinc-100 hover:bg-zinc-200 text-zinc-800 dark:bg-zinc-850 dark:hover:bg-zinc-800 dark:text-zinc-200",
        danger: "bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/20 dark:hover:bg-red-950/40 dark:text-red-400 border border-red-100 dark:border-red-900/50"
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${baseStyle} ${variants[variant]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}

export default Button;
