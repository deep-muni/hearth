'use client';

import React, { useState } from 'react';
import { Box, Flex } from '@chakra-ui/react';
import { Copy, MessageCircle } from 'lucide-react';
import { HearthModalShell } from '@/app/staff-budget/components/modals/HearthModalShell';
import { DayMenu, MealSlotConfig, ShareScope } from '../../types';
import { buttonBase } from '../../constants';
import { formatDayMenuForWhatsApp, formatWeekMenuForWhatsApp } from '../../utils/mealFormatters';
import { Segmented } from '../ui/Segmented';

interface ShareSheetProps {
  isOpen: boolean;
  onClose: () => void;
  weekStart: string;
  dayMenus: Record<string, DayMenu>;
  todayMenu: DayMenu;
  slotConfigs: MealSlotConfig[];
}

export const ShareSheet: React.FC<ShareSheetProps> = ({
  isOpen,
  onClose,
  weekStart,
  dayMenus,
  todayMenu,
  slotConfigs,
}) => {
  const [scope, setScope] = useState<ShareScope>('week');
  const [copied, setCopied] = useState(false);
  const message =
    scope === 'week'
      ? formatWeekMenuForWhatsApp(weekStart, dayMenus)
      : formatDayMenuForWhatsApp(todayMenu, slotConfigs);

  const copyText = async () => {
    await navigator.clipboard.writeText(message);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2500);
  };

  const openWhatsApp = async () => {
    if (navigator.share && navigator.maxTouchPoints > 0) {
      await navigator.share({ text: message });
      return;
    }
    window.open(
      `https://wa.me/?text=${encodeURIComponent(message)}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  return (
    <HearthModalShell
      isOpen={isOpen}
      onClose={onClose}
      title="Send the menu"
      subtitle="WhatsApp-ready text for your cook"
      maxWidth="440px"
    >
      <Segmented
        value={scope}
        options={[
          ['week', 'Whole week'],
          ['today', 'Today only'],
        ]}
        onChange={(value) => setScope(value as ShareScope)}
      />
      <Box
        as="pre"
        maxH="260px"
        overflowY="auto"
        mt="14px"
        p="15px"
        borderRadius="14px"
        bg="var(--hh-sunken)"
        border="1px solid var(--hh-line)"
        color="var(--hh-ink)"
        fontFamily="monospace"
        fontSize="12px"
        lineHeight="1.6"
        whiteSpace="pre-wrap"
      >
        {message}
      </Box>
      <Flex gap="10px" mt="16px">
        <button
          type="button"
          onClick={() => void copyText()}
          style={{ ...buttonBase, flex: 1, background: 'transparent', color: 'var(--hh-ink)' }}
        >
          <Copy size={14} /> {copied ? 'Copied' : 'Copy text'}
        </button>
        <button
          type="button"
          onClick={() => void openWhatsApp()}
          style={{
            ...buttonBase,
            flex: 1,
            borderColor: 'var(--hh-accent)',
            background: 'var(--hh-accent)',
            color: '#ffffff',
          }}
        >
          <MessageCircle size={14} /> Open WhatsApp
        </button>
      </Flex>
    </HearthModalShell>
  );
};
