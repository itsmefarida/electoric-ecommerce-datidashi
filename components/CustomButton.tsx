import React from "react";

interface CustomButtonProps {
  text: string;
  buttonType?: "submit" | "reset" | "button";
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  title?: string;
  children?: React.ReactNode;
  variant?: "primary" | "secondary" | "outline"; // VARIANT BARU
}

const CustomButton = ({
  text,
  buttonType = "button",
  className = "",
  onClick,
  disabled,
  title,
  children,
  variant = "primary", // Default variant
}: CustomButtonProps) => {

  // Base classes yang konsisten
  const baseClasses = `
    uppercase 
    font-bold 
    shadow-sm 
    focus:outline-none 
    focus:ring-2 
    focus:ring-blue-500 
    focus:ring-offset-2
    transition-colors 
    duration-200
    disabled:opacity-50 
    disabled:cursor-not-allowed
    px-4 
    py-2 
    text-base
    border
  `.replace(/\s+/g, ' ').trim();

  // Variant styles
  const variantClasses = {
    primary: "bg-blue-500 hover:bg-blue-600 text-white border-transparent",
    secondary: "bg-gray-500 hover:bg-gray-600 text-white border-transparent", 
    outline: "bg-white border-gray-300 text-blue-600 hover:bg-gray-100"
  };

  return (
    <button
      type={buttonType}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {text}
      {children}
    </button>
  );
};

export default CustomButton;