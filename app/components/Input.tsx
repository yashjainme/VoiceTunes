import { FC, InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

const Input: FC<InputProps> = ({ className = "", ...props }) => {
  return (
    <input
      className={`w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded 
        text-white placeholder-gray-400 focus:outline-none focus:ring-2 
        focus:ring-purple-500 ${className}`}
      {...props}
    />
  );
};

export default Input;