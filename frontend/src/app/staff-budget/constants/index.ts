import { AttendanceStatus, SalaryType } from '../types';
import { Check, X as XIcon, Minus, Gift, Coffee } from 'lucide-react';

export const PRESET_ROLES = [
  { role: 'Cook', icon: 'cook' },
  { role: 'Housekeeper', icon: 'housekeeper' },
  { role: 'Driver', icon: 'driver' },
  { role: 'Nanny', icon: 'nanny' },
  { role: 'Laundry', icon: 'laundry' },
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

export const SALARY_TYPES: { type: SalaryType; label: string; description: string }[] = [
  {
    type: 'DAYS_LEAVES',
    label: 'Days & leaves',
    description: 'Based on working days and leave deductions (uses calendar).',
  },
  {
    type: 'FIXED',
    label: 'Fixed salary',
    description: 'Fixed monthly salary without daily attendance (no calendar needed).',
  },
  {
    type: 'COUNT_BASED',
    label: 'Based on count',
    description: 'Calculated by items given on each date (uses calendar).',
  },
];

export interface StatusConfig {
  status: AttendanceStatus;
  label: string;
  shortLabel: string;
  glyph: string;
  icon: typeof Check;
  color: string;
  bg: string;
}

export const STATUS_CONFIGS: Record<AttendanceStatus, StatusConfig> = {
  PRESENT: {
    status: 'PRESENT',
    label: 'Present',
    shortLabel: 'Present',
    glyph: '✓',
    icon: Check,
    color: '#3F7A57',
    bg: '#f8fafc',
  },
  FULL_LEAVE: {
    status: 'FULL_LEAVE',
    label: 'Full day leave',
    shortLabel: 'Full',
    glyph: '✕',
    icon: XIcon,
    color: '#B4403A',
    bg: '#fef2f2',
  },
  HALF_LEAVE: {
    status: 'HALF_LEAVE',
    label: 'Half day leave',
    shortLabel: 'Half',
    glyph: '—',
    icon: Minus,
    color: '#C07A28',
    bg: '#fffbeb',
  },
  PAID_LEAVE: {
    status: 'PAID_LEAVE',
    label: 'Paid leave',
    shortLabel: 'Paid',
    glyph: '★',
    icon: Gift,
    color: '#7A5B9A',
    bg: '#f5f3ff',
  },
  WEEKLY_OFF: {
    status: 'WEEKLY_OFF',
    label: 'Weekly off',
    shortLabel: 'Off',
    glyph: '○',
    icon: Coffee,
    color: '#9A9184',
    bg: '#f8fafc',
  },
};
