import React from 'react';
import { IconProps } from './types';

export type RoleIconId =
  'cook' | 'housekeeper' | 'driver' | 'nanny' | 'laundry' | 'garden' | 'security' | 'care';

export interface RoleIconDefinition {
  id: RoleIconId;
  label: string;
  d: string;
}

const ROLE_ICONS: Record<RoleIconId, RoleIconDefinition> = {
  cook: {
    id: 'cook',
    label: 'Cook / Chef',
    d: 'M4.5 10.5h15v3a5 5 0 0 1-5 5h-5a5 5 0 0 1-5-5ZM5 10.5a3.5 3.5 0 0 1 3.5-3.5h7a3.5 3.5 0 0 1 3.5 3.5M2.5 13.5h2M19.5 13.5h2M12 4v1.5',
  },
  housekeeper: {
    id: 'housekeeper',
    label: 'Housekeeper / Maid',
    d: 'M20.5 3.5 13 11M12.4 9.6 8 14l2 2 4.4-4.4ZM8.6 15.4 3.5 20.5M10.6 17.4 5.5 22.5',
  },
  driver: {
    id: 'driver',
    label: 'Driver',
    d: 'M4.5 16.5h15v-3.2l-1.9-4.3H6.4L4.5 13.3ZM8 19.2a1.6 1.6 0 1 0 0-3.2 1.6 1.6 0 0 0 0 3.2ZM16 19.2a1.6 1.6 0 1 0 0-3.2 1.6 1.6 0 0 0 0 3.2Z',
  },
  nanny: {
    id: 'nanny',
    label: 'Nanny / Childcare',
    d: 'M12 11.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM5.5 20.5c0-3.2 2.9-5 6.5-5s6.5 1.8 6.5 5',
  },
  laundry: {
    id: 'laundry',
    label: 'Laundry / Ironing',
    d: 'M4 9.5h16l-1.4 10.5H5.4ZM8.2 9.5C8.2 6.3 9.9 4 12 4s3.8 2.3 3.8 5.5M9.7 12.6l.5 4.3M14.3 12.6l-.5 4.3',
  },
  garden: {
    id: 'garden',
    label: 'Gardener',
    d: 'M12 21V11M12 11c0-4 3-7 8-7 0 5-3.5 7-8 7ZM12 13c0-3.5-2.6-6-7-6 0 4.4 3 6 7 6Z',
  },
  security: {
    id: 'security',
    label: 'Security / Guard',
    d: 'M12 3.5 19.5 6v5.5c0 4.3-3.1 7.4-7.5 9-4.4-1.6-7.5-4.7-7.5-9V6Z',
  },
  care: {
    id: 'care',
    label: 'Caregiver / Nurse',
    d: 'M12 20.5C7 17 3.5 14.4 3.5 10.8A4.3 4.3 0 0 1 12 8.5a4.3 4.3 0 0 1 8.5 2.3c0 3.6-3.5 6.2-8.5 9.7Z',
  },
};

export const ROLE_ICON_LIST = Object.values(ROLE_ICONS);

export function resolveRoleIcon(role?: string, customIcon?: string): RoleIconId {
  if (customIcon && customIcon in ROLE_ICONS) {
    return customIcon as RoleIconId;
  }
  const r = (role || '').toLowerCase();
  if (r.includes('laundry') || r.includes('iron') || r.includes('cloth') || r.includes('wash'))
    return 'laundry';
  if (
    r.includes('house') ||
    r.includes('clean') ||
    r.includes('maid') ||
    r.includes('broom') ||
    r.includes('dust')
  )
    return 'housekeeper';
  if (r.includes('car') || r.includes('driv') || r.includes('chauffeur')) return 'driver';
  if (r.includes('cook') || r.includes('chef') || r.includes('meal') || r.includes('kitchen'))
    return 'cook';
  if (
    r.includes('nanny') ||
    r.includes('child') ||
    r.includes('baby') ||
    r.includes('sitter') ||
    r.includes('kid')
  )
    return 'nanny';
  if (r.includes('garden') || r.includes('plant') || r.includes('lawn')) return 'garden';
  if (r.includes('guard') || r.includes('sec') || r.includes('watch')) return 'security';
  if (r.includes('care') || r.includes('elder') || r.includes('nurse')) return 'care';

  return 'housekeeper';
}

export interface RoleIconProps extends IconProps {
  name: RoleIconId | string;
}

export const RoleIcon: React.FC<RoleIconProps> = ({
  name,
  size = 20,
  strokeWidth = 1.6,
  ...props
}) => {
  const iconId = (name in ROLE_ICONS ? name : resolveRoleIcon(name)) as RoleIconId;
  const iconDef = ROLE_ICONS[iconId] || ROLE_ICONS.housekeeper;

  return (
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
      <path d={iconDef.d} />
    </svg>
  );
};
