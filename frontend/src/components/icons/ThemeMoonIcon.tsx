import React from 'react';
import { IconProps } from './types';

export const ThemeMoonIcon: React.FC<IconProps> = ({
  size = 17,
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
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
    </svg>
  );
};

ThemeMoonIcon.displayName = 'ThemeMoonIcon';
