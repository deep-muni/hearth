"use client";

import React, { HTMLAttributes, forwardRef } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'subtle' | 'outline';
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, variant = 'default', style, ...props }, ref) => {
    let bg = '#ffffff';
    let border = '1px solid #e2e8f0';
    let boxShadow = '0 1px 3px rgba(0, 0, 0, 0.02)';

    if (variant === 'subtle') {
      bg = '#f8fafc';
      border = '1px solid #f1f5f9';
      boxShadow = 'none';
    } else if (variant === 'outline') {
      bg = 'transparent';
      border = '1px solid #e2e8f0';
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
