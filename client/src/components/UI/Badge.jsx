import React from 'react';

export const Badge = ({
  children,
  variant = 'info',
  className = '',
  ...props
}) => {
  const baseStyle = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-all duration-300';
  
  const variants = {
    info: 'bg-accentCyan/10 text-accentCyan border-accentCyan/20',
    purple: 'bg-accentPurple/10 text-accentPurple border-accentPurple/20',
    success: 'bg-successGreen/10 text-successGreen border-successGreen/20',
    warning: 'bg-warningAmber/10 text-warningAmber border-warningAmber/20',
    danger: 'bg-dangerRed/10 text-dangerRed border-dangerRed/20',
    secondary: 'bg-darkBorder/30 text-textSecondary border-darkBorder'
  };

  return (
    <span
      className={`${baseStyle} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
