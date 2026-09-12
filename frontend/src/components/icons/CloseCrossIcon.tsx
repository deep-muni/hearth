import React from 'react';
import { IconProps } from './types';

export const CloseCrossIcon: React.FC<IconProps> = ({ size = 24, strokeWidth = 2, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);
