import React from 'react';
import { IconProps } from './types';

export const CalendarOffIcon: React.FC<IconProps> = ({
  size = 24,
  strokeWidth = 1.7,
  ...props
}) => (
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
    <rect x="3" y="5" width="18" height="16" rx="3" />
    <path d="M3 10h18M8 3v4M16 3v4M8.5 15.5l7 0" />
  </svg>
);
