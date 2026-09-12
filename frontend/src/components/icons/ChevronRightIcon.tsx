import React from 'react';
import { IconProps } from './types';

export const ChevronRightIcon: React.FC<IconProps> = ({
  size = 18,
  width,
  height,
  className,
  strokeWidth = 1.8,
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
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
};

ChevronRightIcon.displayName = 'ChevronRightIcon';
