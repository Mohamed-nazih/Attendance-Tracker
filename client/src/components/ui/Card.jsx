import React from 'react';

export const Card = ({ children, className = '', ...props }) => {
  return (
    <div 
      className={`bg-card border-app border rounded-2xl shadow-sm p-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
