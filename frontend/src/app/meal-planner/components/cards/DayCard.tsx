'use client';

import React from 'react';
import { Box, Flex, Text } from '@chakra-ui/react';
import { Check, ChevronDown, RotateCcw } from 'lucide-react';
import { WeekDayInfo } from '@/utils/dateUtils';
import { DayMenu, LibraryDish, MealSlotConfig } from '../../types';
import { buttonBase } from '../../constants';
import { StatusPill } from '../ui/StatusPill';
import { MealSlotBlock } from './MealSlotBlock';

interface DayCardProps {
  day: WeekDayInfo;
  menu: DayMenu;
  slots: MealSlotConfig[];
  isOpen: boolean;
  isEdited: boolean;
  library: LibraryDish[];
  drafts: Record<string, string>;
  onDraftChange: (key: string, value: string) => void;
  onToggle: () => void;
  onAddDish: (day: WeekDayInfo, slot: MealSlotConfig, value: string) => Promise<void>;
  onRemoveDish: (day: WeekDayInfo, slot: MealSlotConfig, index: number) => Promise<void>;
  onBackToRoutine: (day: WeekDayInfo) => Promise<void>;
  onPromote: (day: WeekDayInfo) => Promise<void>;
}

export const DayCard: React.FC<DayCardProps> = ({
  day,
  menu,
  slots,
  isOpen,
  isEdited,
  library,
  drafts,
  onDraftChange,
  onToggle,
  onAddDish,
  onRemoveDish,
  onBackToRoutine,
  onPromote,
}) => {
  const summary = menu.slots
    .filter((slot) => slot.items.length > 0)
    .map((slot) => `${slot.name} · ${slot.items.join(', ')}`)
    .join('  ·  ');
  const status = day.isToday ? 'Today' : isEdited ? 'Edited' : 'Routine';

  return (
    <Box
      borderRadius="20px"
      bg="var(--hh-card)"
      border={`1px solid ${isOpen ? 'var(--hh-accent)' : 'var(--hh-line)'}`}
      boxShadow={
        isOpen ? '0 14px 30px -18px rgba(28, 26, 23, 0.38)' : '0 1px 2px rgba(28, 26, 23, 0.03)'
      }
    >
      <Box
        as="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        w="100%"
        display="grid"
        gridTemplateColumns="46px minmax(0, 1fr) 18px"
        gap="14px"
        alignItems="center"
        p="14px 15px"
        textAlign="left"
        bg="transparent"
        border={0}
        cursor="pointer"
        color="inherit"
      >
        <Flex
          w="46px"
          h="50px"
          borderRadius="14px"
          bg={day.isToday ? 'var(--hh-ink)' : 'var(--hh-accentSoft)'}
          color={day.isToday ? 'var(--hh-paper)' : 'var(--hh-accentInk)'}
          direction="column"
          align="center"
          justify="center"
        >
          <Text
            fontSize="9.5px"
            fontWeight={600}
            letterSpacing="0.1em"
            textTransform="uppercase"
            opacity={0.75}
          >
            {day.dayName}
          </Text>
          <Text fontFamily="'Instrument Serif', Georgia, serif" fontSize="19px" lineHeight="1">
            {day.dayNumber}
          </Text>
        </Flex>
        <Box minW="0">
          <Flex align="center" gap="8px" mb="4px" wrap="wrap">
            <Text fontSize="15.5px" fontWeight={600} color="var(--hh-ink)">
              {day.dayFullName}
            </Text>
            <StatusPill status={status} />
          </Flex>
          <Text
            fontSize="12.5px"
            color="var(--hh-muted)"
            overflow="hidden"
            textOverflow="ellipsis"
            whiteSpace="nowrap"
          >
            {summary || 'Nothing planned — tap to add'}
          </Text>
        </Box>
        <Box
          color="var(--hh-muted)"
          transform={isOpen ? 'rotate(180deg)' : 'none'}
          transition="transform 220ms ease"
        >
          <ChevronDown size={16} />
        </Box>
      </Box>
      {isOpen && (
        <Flex direction="column" gap="10px" p="4px 15px 15px" animation="hubRise 220ms ease both">
          {slots.map((slotConfig) => {
            const slot = menu.slots.find((item) => item.slotConfigId === slotConfig.id);
            return (
              <MealSlotBlock
                key={slotConfig.id}
                slotConfig={slotConfig}
                items={slot?.items || []}
                library={library}
                draft={drafts[`${day.dateStr}-${slotConfig.id}`] || ''}
                onDraftChange={(value) => onDraftChange(`${day.dateStr}-${slotConfig.id}`, value)}
                onAdd={(value) => onAddDish(day, slotConfig, value)}
                onRemove={(index) => onRemoveDish(day, slotConfig, index)}
              />
            );
          })}
          <Flex justify="space-between" gap="8px" wrap="wrap">
            {isEdited ? (
              <button
                type="button"
                onClick={() => void onBackToRoutine(day)}
                style={{ ...buttonBase, background: 'transparent', color: 'var(--hh-muted)' }}
              >
                <RotateCcw size={14} /> Back to routine
              </button>
            ) : (
              <span />
            )}
            <button
              type="button"
              onClick={() => void onPromote(day)}
              style={{ ...buttonBase, background: 'transparent', color: 'var(--hh-ink)' }}
            >
              <Check size={14} /> Make this the usual {day.dayFullName}
            </button>
          </Flex>
        </Flex>
      )}
    </Box>
  );
};
