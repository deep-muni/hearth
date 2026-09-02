'use client';

import React, { ButtonHTMLAttributes, forwardRef } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
export type ButtonSize = 'xs' | 'sm' | 'md';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

const VARIANT_STYLES: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    background: '#0f172a',
    color: '#ffffff',
    border: 'none',
  },
  secondary: {
    background: '#f1f5f9',
    color: '#0f172a',
    border: 'none',
  },
  outline: {
    background: '#ffffff',
    color: '#475569',
    border: '1px solid #e2e8f0',
  },
  ghost: {
    background: 'transparent',
    color: '#64748b',
    border: 'none',
  },
  danger: {
    background: '#fef2f2',
    color: '#ef4444',
    border: '1px solid #fee2e2',
  },
  success: {
    background: '#ecfdf5',
    color: '#065f46',
    border: '1px solid #a7f3d0',
  },
};

const SIZE_STYLES: Record<ButtonSize, React.CSSProperties> = {
  xs: {
    padding: '3px 8px',
    fontSize: '11px',
    borderRadius: '6px',
    gap: '4px',
  },
  sm: {
    padding: '5px 12px',
    fontSize: '11px',
    borderRadius: '8px',
    gap: '5px',
  },
  md: {
    padding: '7px 16px',
    fontSize: '12px',
    borderRadius: '8px',
    gap: '6px',
  },
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'outline',
      size = 'sm',
      icon,
      fullWidth = false,
      style,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 600,
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1,
          width: fullWidth ? '100%' : 'auto',
          transition: 'all 0.12s ease',
          userSelect: 'none',
          ...VARIANT_STYLES[variant],
          ...SIZE_STYLES[size],
          ...style,
        }}
        {...props}
      >
        {icon && <span style={{ display: 'inline-flex', alignItems: 'center' }}>{icon}</span>}
        {children && <span>{children}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
