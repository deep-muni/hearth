import React from 'react';
import { IconProps } from '@/components/icons';

export interface WorkspaceItem {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<IconProps>;
}
