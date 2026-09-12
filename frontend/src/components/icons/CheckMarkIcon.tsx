import React from 'react';
import { IconProps } from './types';

export const CheckMarkIcon: React.FC<IconProps> = ({ size = 24, strokeWidth = 2.2, ...props }) => (
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
    <path d="M5 12.5l4.5 4.5L19 7" />
  </svg>
);
