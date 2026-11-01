import React from 'react';

export const CRTOverlay: React.FC = () => {
  return (
    <div 
      className="fixed inset-0 pointer-events-none z-50 crt-scanlines" 
      aria-hidden="true"
    />
  );
};

