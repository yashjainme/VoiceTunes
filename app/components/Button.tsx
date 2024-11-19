import { FC, ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline";
}

const Button: FC<ButtonProps> = ({ 
  children, 
  className = "", 
  variant = "primary", 
  ...props 
}) => {
  const baseStyle = "px-4 py-2 rounded font-semibold transition-colors";
  const variants = {
    primary: "bg-purple-600 text-white hover:bg-purple-700",
    outline: "bg-transparent border border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-gray-900",
  };
  
  return (
    <button 
      className={`${baseStyle} ${variants[variant]} ${className}`} 
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;