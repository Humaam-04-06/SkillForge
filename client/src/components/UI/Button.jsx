import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';

export const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  isLoading = false,
  icon = null,
  className = '',
  ...props
}) => {
  const baseStyle = 'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-300 transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none focus:ring-accentCyan focus:ring-offset-darkBg';
  
  const variants = {
    primary: 'bg-gradient-to-r from-accentPurple to-accentCyan text-white hover:brightness-110 shadow-lg hover:shadow-accentCyan/10 border-0',
    secondary: 'bg-darkCard text-textPrimary hover:bg-slate-800 border border-darkBorder',
    danger: 'bg-dangerRed text-white hover:bg-red-600 shadow-md',
    success: 'bg-successGreen text-white hover:bg-emerald-600 shadow-md',
    outline: 'bg-transparent text-accentCyan border border-accentCyan/30 hover:bg-accentCyan/10 focus:ring-accentCyan',
    ghost: 'bg-transparent text-textSecondary hover:bg-darkCard hover:text-textPrimary'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3 text-base'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {isLoading && (
        <FontAwesomeIcon icon={faCircleNotch} className="animate-spin mr-2" />
      )}
      {!isLoading && icon && (
        <span className="mr-2">{icon}</span>
      )}
      {children}
    </button>
  );
};

export default Button;
