'use client';

import React, { HTMLAttributes, forwardRef } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'subtle' | 'outline';
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, variant = 'default', style, ...props }, ref) => {
    let bg = 'var(--bg-card)';
    let border = '1px solid var(--border-color)';
    let boxShadow = 'var(--shadow-card)';

    if (variant === 'subtle') {
      bg = 'var(--bg-card-subtle)';
      border = '1px solid var(--border-subtle)';
      boxShadow = 'none';
    } else if (variant === 'outline') {
      bg = 'transparent';
      border = '1px solid var(--border-color)';
      boxShadow = 'none';
    }

    return (
      <div
        ref={ref}
        style={{
          background: bg,
          border,
          borderRadius: '16px',
          boxShadow,
          padding: '14px',
          transition: 'background-color 0.15s ease, border-color 0.15s ease',
          ...style,
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
