'use client';

import React, { useState } from 'react';
import { Box, Flex, Text } from '@chakra-ui/react';
import { Plus, Search, Trash2 } from 'lucide-react';
import { DishSuggestion, LibraryDish } from '../../types';
import { buttonBase } from '../../constants';
import { normalizeDishName, slugify } from '../../utils/mealLibrary';
import { TinyButton } from '../ui/TinyButton';

interface DishesTabProps {
  library: LibraryDish[];
  onSaveDish: (dish: DishSuggestion) => Promise<void>;
  onDeleteDish: (dish: LibraryDish) => Promise<void>;
}

export const DishesTab: React.FC<DishesTabProps> = ({
  library,
  onSaveDish,
  onDeleteDish,
}) => {
  const [query, setQuery] = useState('');
  const normalized = normalizeDishName(query);
  const exactMatch = library.some((dish) => dish.name.toLowerCase() === normalized.toLowerCase());
  const visible = library.filter((dish) => dish.name.toLowerCase().includes(query.toLowerCase()));

  const addDish = async () => {
    if (!normalized || exactMatch) return;
    await onSaveDish({
      id: `dish-${slugify(normalized) || Date.now()}`,
      name: normalized,
      category: 'all',
      isVeg: true,
      tags: [],
    });
    setQuery('');
  };

  return (
    <Flex direction="column" gap="10px">
      <Text fontSize="12.5px" lineHeight="1.55" color="var(--hh-muted)">
        Dishes are remembered as you type them here or while planning.
      </Text>
      <Box position="relative">
        <Search
          size={15}
          style={{ position: 'absolute', left: 13, top: 15, color: 'var(--hh-muted)' }}
        />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              void addDish();
            }
          }}
          placeholder="Search or add a dish"
          style={{
            width: '100%',
            minHeight: 46,
            borderRadius: 13,
            border: '1px solid var(--hh-line)',
            background: 'var(--hh-cardHover)',
            color: 'var(--hh-ink)',
            padding: '0 12px 0 36px',
            fontSize: 13,
          }}
        />
      </Box>
      {normalized && !exactMatch && (
        <button
          type="button"
          onClick={() => void addDish()}
          style={{
            ...buttonBase,
            justifyContent: 'flex-start',
            borderRadius: 13,
            borderStyle: 'dashed',
            borderColor: 'var(--hh-accent)',
            background: 'var(--hh-accentSoft)',
            color: 'var(--hh-accentInk)',
          }}
        >
          <Plus size={14} /> Add “{normalized}” to dishes
        </button>
      )}
      {visible.map((dish) => (
        <Flex
          key={dish.name}
          align="center"
          justify="space-between"
          gap="10px"
          p="11px 12px"
          borderRadius="13px"
          bg="var(--hh-sunken)"
        >
          <Box minW="0">
            <Text
              fontSize="13.5px"
              fontWeight={600}
              color="var(--hh-ink)"
              whiteSpace="nowrap"
              overflow="hidden"
              textOverflow="ellipsis"
            >
              {dish.name}
            </Text>
            <Text fontSize="11.5px" color="var(--hh-muted)">
              {dish.totalUses
                ? `${dish.slots.join(', ')} · used ${dish.totalUses}×`
                : 'Not used yet'}
            </Text>
          </Box>
          <TinyButton label={`Forget ${dish.name}`} danger onClick={() => void onDeleteDish(dish)}>
            <Trash2 size={14} />
          </TinyButton>
        </Flex>
      ))}
    </Flex>
  );
};
