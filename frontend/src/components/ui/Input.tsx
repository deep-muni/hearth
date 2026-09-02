"use client";

import React, { InputHTMLAttributes, forwardRef } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, style, id, ...props }, ref) => {
    return (
      <div style={{ width: '100%' }}>
        {label && (
          <label
            htmlFor={id}
            style={{
              display: 'block',
              fontSize: '11px',
              fontWeight: 600,
              color: '#64748b',
              marginBottom: '3px',
            }}
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          style={{
            width: '100%',
            padding: '7px 10px',
            borderRadius: '8px',
            border: `1px solid ${error ? '#ef4444' : '#e2e8f0'}`,
            fontSize: '12px',
            color: '#0f172a',
            backgroundColor: '#ffffff',
            outline: 'none',
            boxSizing: 'border-box',
            transition: 'border-color 0.12s ease',
            ...style,
          }}
          {...props}
        />
        {error && (
          <div style={{ fontSize: '10px', color: '#ef4444', marginTop: '2px' }}>
            {error}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
