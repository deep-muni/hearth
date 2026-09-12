import React from 'react';
import { IconProps } from './types';

export const EditPencilIcon: React.FC<IconProps> = ({
  size = 24,
  strokeWidth = 1.8,
  style,
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
    style={{ pointerEvents: 'none', ...style }}
    {...props}
  >
    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
  </svg>
);
