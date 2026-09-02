import { AttendanceStatus, SalaryType } from '@/types';
import {
  Check,
  X as XIcon,
  Minus,
  Gift,
  Coffee,
} from 'lucide-react';

export const EMOJI_OPTIONS = ['👩‍🍳', '🧹', '🚗', '👶', '🌿', '🧺', '🛡️', '🌸', '🐕'] as const;

export const PRESET_ROLES = [
  { role: 'Cook', emoji: '👩‍🍳' },
  { role: 'Housekeeper', emoji: '🧹' },
  { role: 'Driver', emoji: '🚗' },
  { role: 'Nanny', emoji: '👶' },
] as const;

export const WEEKDAYS_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S'] as const;

export const WEEKDAY_OPTIONS = [
  { value: -1, label: 'None' },
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
] as const;

export const SALARY_TYPES: { type: SalaryType; label: string }[] = [
  { type: 'FIXED_MONTHLY', label: 'Monthly' },
  { type: 'DAILY_WAGE', label: 'Daily' },
  { type: 'STRICT_FLAT', label: 'Flat' },
];

export interface StatusConfig {
  status: AttendanceStatus;
  label: string;
  shortLabel: string;
  icon: typeof Check;
  color: string;
  bg: string;
}

export const STATUS_CONFIGS: Record<AttendanceStatus, StatusConfig> = {
  PRESENT: {
    status: 'PRESENT',
    label: 'Present',
    shortLabel: 'Present',
    icon: Check,
    color: '#10b981',
    bg: '#f8fafc',
  },
  FULL_LEAVE: {
    status: 'FULL_LEAVE',
    label: 'Full Day Leave',
    shortLabel: 'Leave',
    icon: XIcon,
    color: '#ef4444',
    bg: '#fef2f2',
  },
  HALF_LEAVE: {
    status: 'HALF_LEAVE',
    label: 'Half Day Leave',
    shortLabel: 'Half',
    icon: Minus,
    color: '#f59e0b',
    bg: '#fffbeb',
  },
  PAID_LEAVE: {
    status: 'PAID_LEAVE',
    label: 'Paid Leave',
    shortLabel: 'Paid',
    icon: Gift,
    color: '#8b5cf6',
    bg: '#f5f3ff',
  },
  WEEKLY_OFF: {
    status: 'WEEKLY_OFF',
    label: 'Weekly Off',
    shortLabel: 'Off',
    icon: Coffee,
    color: '#94a3b8',
    bg: '#f8fafc',
  },
};
