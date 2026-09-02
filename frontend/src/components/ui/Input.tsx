'use client';

import React, { InputHTMLAttributes, forwardRef } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, style, id, type, onChange, onFocus, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (type === 'number' && e.target.value) {
        e.target.value = e.target.value.replace(/^0+(?=\d)/, '');
      }
      onChange?.(e);
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      if (type === 'number') {
        e.target.select();
      }
      onFocus?.(e);
    };

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
        <input
          ref={ref}
          id={id}
          type={type}
          onChange={handleChange}
          onFocus={handleFocus}
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
        />
        {error && (
          <div style={{ fontSize: '10px', color: 'var(--color-danger)', marginTop: '2px' }}>
            {error}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
