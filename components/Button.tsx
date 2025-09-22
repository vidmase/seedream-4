
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  icon,
  ...props 
}) => {
  const baseClasses = "relative overflow-hidden font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-50 disabled:transform-none group";
  
  const variantClasses = {
    primary: "bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white shadow-lg hover:shadow-xl focus:ring-primary-300",
    secondary: "bg-gradient-to-r from-secondary-500 to-secondary-600 hover:from-secondary-600 hover:to-secondary-700 text-white shadow-lg hover:shadow-xl focus:ring-secondary-300",
    accent: "bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white shadow-lg hover:shadow-xl focus:ring-accent-300"
  };
  
  const sizeClasses = {
    sm: "py-2 px-4 text-sm",
    md: "py-3 px-6 text-base",
    lg: "py-4 px-8 text-lg"
  };

  return (
    <button
      {...props}
      className={`w-full ${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`}
    >
      <span className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
      <span className="relative flex items-center justify-center gap-2">
        {icon && <span className="transition-transform duration-300 group-hover:scale-110">{icon}</span>}
        {children}
      </span>
    </button>
  );
};

export default Button;
