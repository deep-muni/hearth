'use client';

import React, { HTMLAttributes } from 'react';

export type BadgeVariant = 'success' | 'danger' | 'warning' | 'info' | 'neutral';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const BADGE_STYLES: Record<BadgeVariant, { bg: string; color: string; border: string }> = {
  success: { bg: '#ecfdf5', color: '#065f46', border: '#a7f3d0' },
  danger: { bg: '#fef2f2', color: '#dc2626', border: '#fee2e2' },
  warning: { bg: '#fffbeb', color: '#b45309', border: '#fde68a' },
  info: { bg: '#f5f3ff', color: '#6d28d9', border: '#ddd6fe' },
  neutral: { bg: '#f1f5f9', color: '#475569', border: '#e2e8f0' },
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
