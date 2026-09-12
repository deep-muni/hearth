import React from 'react';
import { IconProps } from './types';

export const MealPlannerIcon: React.FC<IconProps> = ({
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
      <path d="M6.2 3v6.2a2.4 2.4 0 0 0 4.8 0V3" />
      <path d="M8.6 9.6V21" />
      <path d="M16.8 21v-6.6" />
      <path d="M16.8 14.4c1.9 0 3-1.6 3-4.3 0-4-1.1-7.1-3-7.1s-3 3.1-3 7.1c0 2.7 1.1 4.3 3 4.3Z" />
    </svg>
  );
};

MealPlannerIcon.displayName = 'MealPlannerIcon';
