'use client';

import React, { HTMLAttributes } from 'react';

export type BadgeVariant = 'success' | 'danger' | 'warning' | 'info' | 'neutral';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const BADGE_STYLES: Record<BadgeVariant, { bg: string; color: string; border: string }> = {
  success: {
    bg: 'var(--badge-success-bg)',
    color: 'var(--badge-success-color)',
    border: 'var(--badge-success-border)',
  },
  danger: {
    bg: 'var(--badge-danger-bg)',
    color: 'var(--badge-danger-color)',
    border: 'var(--badge-danger-border)',
  },
  warning: {
    bg: 'var(--badge-warning-bg)',
    color: 'var(--badge-warning-color)',
    border: 'var(--badge-warning-border)',
  },
  info: {
    bg: 'var(--badge-info-bg)',
    color: 'var(--badge-info-color)',
    border: 'var(--badge-info-border)',
  },
  neutral: {
    bg: 'var(--badge-neutral-bg)',
    color: 'var(--badge-neutral-color)',
    border: 'var(--badge-neutral-border)',
  },
};

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'neutral', style, ...props }) => {
  const s = BADGE_STYLES[variant];
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '1px 6px',
        borderRadius: '9999px',
        fontSize: '10px',
        fontWeight: 600,
        backgroundColor: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
        lineHeight: '1.2',
        ...style,
      }}
      {...props}
    >
      {children}
    </span>
  );
};
