"use client";

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
              color: '#64748b',
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
            border: `1px solid ${error ? '#ef4444' : '#e2e8f0'}`,
            fontSize: '12px',
            color: '#0f172a',
            backgroundColor: '#ffffff',
            outline: 'none',
            boxSizing: 'border-box',
            ...style,
          }}
          {...props}
        >
          {children}
        </select>
        {error && (
          <div style={{ fontSize: '10px', color: '#ef4444', marginTop: '2px' }}>
            {error}
          </div>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
