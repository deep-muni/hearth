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
    background: 'var(--btn-primary-bg)',
    color: 'var(--btn-primary-text)',
    border: 'none',
  },
  secondary: {
    background: 'var(--btn-secondary-bg)',
    color: 'var(--btn-secondary-text)',
    border: 'none',
  },
  outline: {
    background: 'var(--btn-outline-bg)',
    color: 'var(--btn-outline-text)',
    border: '1px solid var(--btn-outline-border)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--text-muted)',
    border: 'none',
  },
  danger: {
    background: 'var(--btn-danger-bg)',
    color: 'var(--btn-danger-text)',
    border: '1px solid var(--btn-danger-border)',
  },
  success: {
    background: 'var(--btn-success-bg)',
    color: 'var(--btn-success-text)',
    border: '1px solid var(--btn-success-border)',
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
