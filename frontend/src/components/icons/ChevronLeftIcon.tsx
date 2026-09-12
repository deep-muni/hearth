import React from 'react';
import { IconProps } from './types';

export const ChevronLeftIcon: React.FC<IconProps> = ({ size = 24, strokeWidth = 2, ...props }) => (
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
    <path d="M15 18l-6-6 6-6" />
  </svg>
);
