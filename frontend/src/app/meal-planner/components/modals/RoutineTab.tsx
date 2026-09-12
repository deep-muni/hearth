'use client';

import React from 'react';
import { Box, Flex, Text } from '@chakra-ui/react';
import { ChevronDown, X } from 'lucide-react';
import { MealSlotConfig, WeeklyRoutine } from '../../types';
import { DAY_NAMES, buttonBase } from '../../constants';
import { cloneRoutine, normalizeDishName, slotToConfigSlot } from '../../utils/mealLibrary';

interface RoutineTabProps {
  routine: WeeklyRoutine;
  slots: MealSlotConfig[];
  openDay: number;
  onOpenDay: (day: number) => void;
  drafts: Record<string, string>;
  onDraftChange: (key: string, value: string) => void;
  onSaveRoutine: (routine: WeeklyRoutine) => Promise<void>;
}

export const RoutineTab: React.FC<RoutineTabProps> = ({
  routine,
  slots,
  openDay,
  onOpenDay,
  drafts,
  onDraftChange,
  onSaveRoutine,
}) => {
  const updateRoutine = async (dayIndex: number, slotConfig: MealSlotConfig, items: string[]) => {
    const next = cloneRoutine(routine);
    const currentDay = next[dayIndex] || {
      dayOfWeek: dayIndex,
      dayName: DAY_NAMES[dayIndex],
      slots: [],
    };
    const slotsById = new Map(currentDay.slots.map((slot) => [slot.slotConfigId || slot.id, slot]));
    slotsById.set(slotConfig.id, slotToConfigSlot(`routine-${dayIndex}`, slotConfig, items));
    next[dayIndex] = {
      ...currentDay,
      slots: slots.map(
        (slot) => slotsById.get(slot.id) || slotToConfigSlot(`routine-${dayIndex}`, slot)
      ),
    };
    await onSaveRoutine(next);
  };

  return (
    <Flex direction="column" gap="10px">
      <Text fontSize="12.5px" lineHeight="1.55" color="var(--hh-muted)">
        Every week starts from this routine, so no week is ever blank; tap a day to edit it, or use
        &quot;Make this the usual …&quot; from the week view.
      </Text>
      {DAY_NAMES.map((dayName, dayIndex) => {
        const dayRoutine = routine[dayIndex];
        const summary = dayRoutine?.slots
          ?.filter((slot) => slot.items.length)
          .map((slot) => `${slot.name}: ${slot.items.join(', ')}`)
          .join('   ·   ');
        return (
          <Box key={dayName} borderRadius="14px" bg="var(--hh-sunken)">
            <Flex
              as="button"
              onClick={() => onOpenDay(openDay === dayIndex ? -1 : dayIndex)}
              w="100%"
              align="center"
              justify="space-between"
              gap="12px"
              p="12px 13px"
              border={0}
              bg="transparent"
              color="inherit"
              cursor="pointer"
              textAlign="left"
            >
              <Box minW="0">
                <Text
                  fontSize="12px"
                  fontWeight={600}
                  letterSpacing="0.06em"
                  textTransform="uppercase"
                  color="var(--hh-accentInk)"
                >
                  {dayName}
                </Text>
                <Text
                  fontSize="12.5px"
                  color="var(--hh-ink)"
                  whiteSpace="nowrap"
                  overflow="hidden"
                  textOverflow="ellipsis"
                >
                  {summary || 'No routine set'}
                </Text>
              </Box>
              <ChevronDown
                size={15}
                style={{
                  transform: openDay === dayIndex ? 'rotate(180deg)' : 'none',
                  transition: 'transform 220ms ease',
                }}
              />
            </Flex>
            {openDay === dayIndex && (
              <Flex direction="column" gap="8px" p="0 10px 10px">
                {slots.map((slotConfig) => {
                  const routineSlot = dayRoutine?.slots.find(
                    (slot) => slot.slotConfigId === slotConfig.id
                  );
                  const draftKey = `r-${dayIndex}-${slotConfig.id}`;
                  const addDraft = () => {
                    const dish = normalizeDishName(drafts[draftKey] || '');
                    if (!dish) return;
                    void updateRoutine(dayIndex, slotConfig, [...(routineSlot?.items || []), dish]);
                    onDraftChange(draftKey, '');
                  };

                  return (
                    <Box
                      key={slotConfig.id}
                      borderRadius="12px"
                      bg="var(--hh-card)"
                      border="1px solid var(--hh-line)"
                      p="10px"
                    >
                      <Text
                        fontSize="11px"
                        fontWeight={600}
                        textTransform="uppercase"
                        color="var(--hh-muted)"
                        mb="7px"
                      >
                        {slotConfig.name}
                      </Text>
                      <Flex wrap="wrap" gap="6px" mb="8px">
                        {(routineSlot?.items || []).map((item, index) => (
                          <button
                            key={`${item}-${index}`}
                            type="button"
                            onClick={() =>
                              void updateRoutine(
                                dayIndex,
                                slotConfig,
                                (routineSlot?.items || []).filter(
                                  (_, itemIndex) => itemIndex !== index
                                )
                              )
                            }
                            style={{
                              ...buttonBase,
                              minHeight: 34,
                              padding: '5px 8px',
                              background: 'var(--hh-sunken)',
                              color: 'var(--hh-ink)',
                            }}
                          >
                            {item} <X size={12} />
                          </button>
                        ))}
                      </Flex>
                      <Flex gap="7px">
                        <input
                          value={drafts[draftKey] || ''}
                          onChange={(event) => onDraftChange(draftKey, event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                              event.preventDefault();
                              addDraft();
                            }
                          }}
                          placeholder={`Add to ${slotConfig.name.toLowerCase()}`}
                          style={{
                            flex: 1,
                            minHeight: 40,
                            minWidth: 0,
                            borderRadius: 10,
                            border: '1px solid var(--hh-line)',
                            background: 'var(--hh-cardHover)',
                            color: 'var(--hh-ink)',
                            padding: '0 10px',
                            fontSize: 13,
                          }}
                        />
                        <button
                          type="button"
                          onClick={addDraft}
                          style={{
                            ...buttonBase,
                            minHeight: 40,
                            borderRadius: 10,
                            background: 'var(--hh-ink)',
                            color: 'var(--hh-paper)',
                            padding: '0 12px',
                          }}
                        >
                          Add
                        </button>
                      </Flex>
                    </Box>
                  );
                })}
              </Flex>
            )}
          </Box>
        );
      })}
    </Flex>
  );
};
