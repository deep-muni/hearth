'use client';

import React from 'react';

interface TinyButtonProps {
  label: string;
  onClick: () => void;
  danger?: boolean;
  children: React.ReactNode;
}

export const TinyButton: React.FC<TinyButtonProps> = ({
  label,
  onClick,
  danger = false,
  children,
}) => {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      style={{
        width: 34,
        height: 34,
        borderRadius: 10,
        border: 0,
        background: 'transparent',
        color: danger ? '#B4403A' : 'var(--hh-muted)',
        cursor: 'pointer',
        display: 'grid',
        placeItems: 'center',
      }}
    >
      {children}
    </button>
  );
};
