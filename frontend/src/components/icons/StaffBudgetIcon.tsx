import React from 'react';
import { IconProps } from './types';

export const StaffBudgetIcon: React.FC<IconProps> = ({
  size = 23,
  width,
  height,
  className,
  strokeWidth = 1.7,
  ...props
}) => {
  const w = width ?? size;
  const h = height ?? size;

  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path d="M9 11a3.2 3.2 0 1 0 0-6.4A3.2 3.2 0 0 0 9 11Z" />
      <path d="M2.8 19.2c0-2.9 2.8-4.6 6.2-4.6 1.3 0 2.5.25 3.5.7" />
      <path d="M16.4 10.2a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
      <path d="M15.4 20.6h5.8a1 1 0 0 0 1-1v-4.3a1 1 0 0 0-1-1h-5.8a1 1 0 0 0-1 1v4.3a1 1 0 0 0 1 1Z" />
      <path d="M19 17.6h1.4" />
    </svg>
  );
};

StaffBudgetIcon.displayName = 'StaffBudgetIcon';
