'use client';

import React, { SelectHTMLAttributes, forwardRef } from 'react';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, style, id, children, ...props }, ref) => {
    return (
      <div style={{ width: '100%' }}>
        {label && (
          <label
            htmlFor={id}
            style={{
              display: 'block',
              fontSize: '11px',
              fontWeight: 600,
              color: 'var(--text-muted)',
              marginBottom: '3px',
            }}
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={id}
          style={{
            width: '100%',
            padding: '7px 10px',
            borderRadius: '8px',
            border: `1px solid ${error ? 'var(--color-danger)' : 'var(--border-color)'}`,
            fontSize: '12px',
            color: 'var(--text-primary)',
            backgroundColor: 'var(--bg-input)',
            outline: 'none',
            boxSizing: 'border-box',
            transition: 'border-color 0.12s ease, background-color 0.12s ease',
            ...style,
          }}
          {...props}
        >
          {children}
        </select>
        {error && (
          <div style={{ fontSize: '10px', color: 'var(--color-danger)', marginTop: '2px' }}>
            {error}
          </div>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
