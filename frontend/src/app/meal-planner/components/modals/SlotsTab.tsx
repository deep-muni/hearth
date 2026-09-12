'use client';

import React, { useState } from 'react';
import { Box, Flex, Text } from '@chakra-ui/react';
import { ArrowDown, ArrowUp, Trash2 } from 'lucide-react';
import { MealSlotConfig } from '../../types';
import { buttonBase } from '../../constants';
import { getOrderedSlots, normalizeDishName, slugify } from '../../utils/mealLibrary';
import { TinyButton } from '../ui/TinyButton';

interface SlotsTabProps {
  slots: MealSlotConfig[];
  onSaveSlots: (slots: MealSlotConfig[]) => Promise<void>;
}

export const SlotsTab: React.FC<SlotsTabProps> = ({ slots, onSaveSlots }) => {
  const [name, setName] = useState('');
  const [time, setTime] = useState('');
  const ordered = getOrderedSlots(slots);

  const save = (next: MealSlotConfig[]) =>
    onSaveSlots(next.map((slot, index) => ({ ...slot, order: index + 1, isEnabled: true })));

  const move = (index: number, direction: -1 | 1) => {
    const next = [...ordered];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    const moving = next[index];
    next[index] = next[target];
    next[target] = moving;
    void save(next);
  };

  return (
    <Flex direction="column" gap="10px">
      {ordered.map((slot, index) => (
        <Flex
          key={slot.id}
          align="center"
          justify="space-between"
          gap="10px"
          p="12px 13px"
          borderRadius="14px"
          bg="var(--hh-cardHover)"
          border="1px solid var(--hh-line)"
        >
          <Box>
            <Text fontSize="14px" fontWeight={600} color="var(--hh-ink)">
              {slot.name}
            </Text>
            <Text fontSize="12px" color="var(--hh-muted)">
              {slot.defaultTime || 'No time set'}
            </Text>
          </Box>
          <Flex gap="4px">
            <TinyButton label="Move earlier" onClick={() => move(index, -1)}>
              <ArrowUp size={14} />
            </TinyButton>
            <TinyButton label="Move later" onClick={() => move(index, 1)}>
              <ArrowDown size={14} />
            </TinyButton>
            <TinyButton
              label="Delete meal time"
              danger
              onClick={() => void save(ordered.filter((item) => item.id !== slot.id))}
            >
              <Trash2 size={14} />
            </TinyButton>
          </Flex>
        </Flex>
      ))}
      <Box display="grid" gridTemplateColumns="1.4fr 1fr auto" gap="8px">
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Slot name"
          style={{
            minHeight: 44,
            minWidth: 0,
            borderRadius: 12,
            border: '1px solid var(--hh-line)',
            background: 'var(--hh-cardHover)',
            color: 'var(--hh-ink)',
            padding: '0 11px',
            fontSize: 13,
          }}
        />
        <input
          value={time}
          onChange={(event) => setTime(event.target.value)}
          placeholder="5:00 PM"
          style={{
            minHeight: 44,
            minWidth: 0,
            borderRadius: 12,
            border: '1px solid var(--hh-line)',
            background: 'var(--hh-cardHover)',
            color: 'var(--hh-ink)',
            padding: '0 11px',
            fontSize: 13,
          }}
        />
        <button
          type="button"
          onClick={() => {
            const trimmed = normalizeDishName(name);
            if (!trimmed) return;
            void save([
              ...ordered,
              {
                id: slugify(trimmed) || `slot-${Date.now()}`,
                name: trimmed,
                iconEmoji: '🍲',
                defaultTime: normalizeDishName(time) || undefined,
                isEnabled: true,
                order: ordered.length + 1,
              },
            ]);
            setName('');
            setTime('');
          }}
          style={{
            ...buttonBase,
            borderRadius: 12,
            background: 'var(--hh-ink)',
            color: 'var(--hh-paper)',
            padding: '0 14px',
          }}
        >
          Add
        </button>
      </Box>
    </Flex>
  );
};
