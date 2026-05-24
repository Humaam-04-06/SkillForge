import React from 'react';

export const Card = ({
  children,
  title = null,
  subtitle = null,
  action = null,
  className = '',
  bodyClassName = '',
  glass = false,
  ...props
}) => {
  const baseStyle = 'rounded-xl border border-darkBorder bg-darkCard/80 backdrop-blur-md shadow-xl transition-all duration-300';
  const glassStyle = 'bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] shadow-2xl';

  return (
    <div
      className={`${glass ? glassStyle : baseStyle} ${className}`}
      {...props}
    >
      {(title || subtitle || action) && (
        <div className="px-6 py-4 border-b border-darkBorder flex items-center justify-between gap-4">
          <div>
            {title && <h3 className="text-base font-bold text-textPrimary">{title}</h3>}
            {subtitle && <p className="text-xs text-textSecondary mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className={`p-6 ${bodyClassName}`}>
        {children}
      </div>
    </div>
  );
};

export default Card;
