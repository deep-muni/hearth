import React from 'react';

export const DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

export const AVAILABLE_SLOT_ICONS = [
  '🌅',
  '☀️',
  '☕',
  '🌙',
  '🥣',
  '🥗',
  '🥪',
  '🍲',
  '🥤',
  '🍨',
  '🍳',
  '🍎',
] as const;

export const iconButtonProps = {
  variant: 'outline' as const,
  w: '38px',
  h: '38px',
  minW: '38px',
  borderRadius: '12px',
  border: '1px solid var(--hh-line)',
  bg: 'var(--hh-card)',
  color: 'var(--hh-ink)',
  transition: 'transform 160ms ease, background 200ms ease',
  _hover: { transform: 'translateY(-1px)', bg: 'var(--hh-cardHover)' },
};

export const buttonBase: React.CSSProperties = {
  minHeight: '44px',
  border: '1px solid var(--hh-line)',
  borderRadius: '999px',
  padding: '9px 13px',
  fontFamily: "'Instrument Sans', system-ui, sans-serif",
  fontSize: '12.5px',
  fontWeight: 600,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '7px',
};
