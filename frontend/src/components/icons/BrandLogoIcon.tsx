import React from 'react';
import { IconProps } from './types';

export const BrandLogoIcon: React.FC<IconProps> = ({
  size = 34,
  width,
  height,
  className,
  style,
  ...props
}) => {
  const w = width ?? size;
  const h = height ?? size;

  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ flexShrink: 0, ...style }}
      {...props}
    >
      <rect width="40" height="40" rx="12" fill="var(--hh-accent, #2F5D8A)" />
      <path
        d="M9 19.5 L20 10.5 L31 19.5"
        stroke="var(--hh-paper, #F7F4EF)"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.5 21.5 V30 M26.5 21.5 V30 M13.5 25.75 H26.5"
        stroke="var(--hh-paper, #F7F4EF)"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
    </svg>
  );
};

BrandLogoIcon.displayName = 'BrandLogoIcon';
