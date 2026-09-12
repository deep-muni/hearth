import React from 'react';
import { IconProps } from './types';

export const SlipIcon: React.FC<IconProps> = ({ size = 24, strokeWidth = 1.8, ...props }) => (
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
    <path d="M6 3h12v18l-3-2-3 2-3-2-3 2Z" />
    <path d="M9.5 8h5M9.5 12h5" />
  </svg>
);
