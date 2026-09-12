'use client';

import React, { useState } from 'react';
import { Box, Flex, Text } from '@chakra-ui/react';
import { Plus, X } from 'lucide-react';
import { LibraryDish, MealSlotConfig } from '../../types';
import { buttonBase } from '../../constants';

interface MealSlotBlockProps {
  slotConfig: MealSlotConfig;
  items: string[];
  library: LibraryDish[];
  draft: string;
  onDraftChange: (value: string) => void;
  onAdd: (value: string) => Promise<void>;
  onRemove: (index: number) => Promise<void>;
}

export const MealSlotBlock: React.FC<MealSlotBlockProps> = ({
  slotConfig,
  items,
  library,
  draft,
  onDraftChange,
  onAdd,
  onRemove,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const lowerItems = items.map((item) => item.toLowerCase());
  const suggestions = library
    .filter((dish) => dish.name.toLowerCase().includes(draft.toLowerCase()))
    .filter((dish) => !lowerItems.includes(dish.name.toLowerCase()))
    .slice(0, 5);
  const often = library
    .filter((dish) => !lowerItems.includes(dish.name.toLowerCase()))
    .sort(
      (a, b) =>
        (b.slotUses[slotConfig.name] || 0) - (a.slotUses[slotConfig.name] || 0) ||
        a.totalUses - b.totalUses
    )
    .slice(0, 4);

  const commit = async (value = draft) => {
    await onAdd(value);
    setActiveIndex(0);
  };

  return (
    <Box borderRadius="14px" bg="var(--hh-sunken)" p="12px 13px">
      <Flex justify="space-between" gap="12px" mb="8px">
        <Text
          fontSize="12px"
          fontWeight={600}
          letterSpacing="0.06em"
          textTransform="uppercase"
          color="var(--hh-accentInk)"
        >
          {slotConfig.name}
        </Text>
        {slotConfig.defaultTime && (
          <Text fontSize="11.5px" color="var(--hh-muted)">
            {slotConfig.defaultTime}
          </Text>
        )}
      </Flex>
      <Flex wrap="wrap" gap="6px" mb="8px">
        {items.map((item, index) => (
          <Flex
            key={`${item}-${index}`}
            align="center"
            gap="5px"
            pl="11px"
            pr="4px"
            py="4px"
            minH="32px"
            borderRadius="999px"
            bg="var(--hh-card)"
            border="1px solid var(--hh-line)"
            color="var(--hh-ink)"
            fontSize="13px"
          >
            {item}
            <button
              type="button"
              aria-label={`Remove ${item}`}
              onClick={() => void onRemove(index)}
              style={{
                width: 28,
                height: 28,
                borderRadius: 999,
                border: 0,
                background: 'transparent',
                color: 'var(--hh-muted)',
                cursor: 'pointer',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <X size={13} />
            </button>
          </Flex>
        ))}
      </Flex>
      <Box position="relative">
        <Flex gap="7px">
          <input
            value={draft}
            onChange={(event) => onDraftChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                void commit(suggestions[activeIndex]?.name || draft);
              }
              if (event.key === 'ArrowDown') {
                event.preventDefault();
                setActiveIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
              }
              if (event.key === 'ArrowUp') {
                event.preventDefault();
                setActiveIndex((prev) => Math.max(prev - 1, 0));
              }
            }}
            placeholder={`Add to ${slotConfig.name.toLowerCase()}`}
            aria-label={`Add to ${slotConfig.name}`}
            role="combobox"
            aria-controls={`${slotConfig.id}-suggestions`}
            aria-expanded={draft.length > 0 && suggestions.length > 0}
            style={{
              flex: 1,
              minWidth: 0,
              minHeight: 44,
              borderRadius: 11,
              border: '1px solid var(--hh-line)',
              background: 'var(--hh-cardHover)',
              color: 'var(--hh-ink)',
              padding: '0 12px',
              fontSize: 13,
              outline: 'none',
            }}
          />
          <button
            type="button"
            onClick={() => void commit()}
            style={{
              ...buttonBase,
              borderRadius: 11,
              background: 'var(--hh-ink)',
              color: 'var(--hh-paper)',
              padding: '0 14px',
            }}
          >
            Add
          </button>
        </Flex>
        {draft && suggestions.length > 0 && (
          <Box
            role="listbox"
            id={`${slotConfig.id}-suggestions`}
            position="absolute"
            top="calc(100% + 6px)"
            left={0}
            right="58px"
            zIndex={20}
            p="5px"
            borderRadius="13px"
            bg="var(--hh-cardHover)"
            border="1px solid var(--hh-line)"
            boxShadow="0 16px 32px -18px rgba(28, 26, 23, 0.45)"
            animation="hubRise 160ms ease both"
          >
            {suggestions.map((dish, index) => (
              <Flex
                as="button"
                role="option"
                aria-selected={activeIndex === index}
                key={dish.name}
                w="100%"
                align="center"
                gap="8px"
                p="8px"
                border={0}
                borderRadius="9px"
                bg={activeIndex === index ? 'var(--hh-sunken)' : 'transparent'}
                color="var(--hh-ink)"
                cursor="pointer"
                onMouseDown={(event) => {
                  event.preventDefault();
                  void commit(dish.name);
                }}
              >
                <Plus size={13} color="var(--hh-muted)" />
                <Text fontSize="13px">{dish.name}</Text>
              </Flex>
            ))}
          </Box>
        )}
      </Box>
      {often.length > 0 && (
        <Flex align="center" wrap="wrap" gap="6px" mt="9px">
          <Text fontSize="11px" fontWeight={600} letterSpacing="0.05em" color="var(--hh-muted)">
            OFTEN
          </Text>
          {often.map((dish) => (
            <button
              key={dish.name}
              type="button"
              onClick={() => void commit(dish.name)}
              style={{
                ...buttonBase,
                minHeight: 34,
                padding: '5px 9px',
                borderStyle: 'dashed',
                background: 'transparent',
                color: 'var(--hh-muted)',
                fontSize: '12.5px',
              }}
            >
              {dish.name}
            </button>
          ))}
        </Flex>
      )}
    </Box>
  );
};
