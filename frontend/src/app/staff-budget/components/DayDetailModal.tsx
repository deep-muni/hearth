'use client';

import React, { useState, useEffect } from 'react';
import { Box, Flex, HStack, VStack, Text, Button, Input } from '@chakra-ui/react';
import { AttendanceRecord, AttendanceStatus, StaffMember } from '../types';
import { STATUS_CONFIGS } from '../constants';
import { HearthModalShell } from './modals/HearthModalShell';
import { TrashIcon } from '@/components/icons';

interface DayDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff: StaffMember;
  dateStr: string;
  currentRecord?: AttendanceRecord;
  onSave: (status: AttendanceStatus, note?: string) => void;
  onRemove: () => void;
}

const ORDERED_STATUSES: AttendanceStatus[] = [
  'PRESENT',
  'FULL_LEAVE',
  'HALF_LEAVE',
  'PAID_LEAVE',
  'WEEKLY_OFF',
];

export const DayDetailModal: React.FC<DayDetailModalProps> = ({
  isOpen,
  onClose,
  staff,
  dateStr,
  currentRecord,
  onSave,
  onRemove,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<AttendanceStatus>(
    currentRecord?.status || 'PRESENT'
  );
  const [note, setNote] = useState<string>(currentRecord?.note || '');

  useEffect(() => {
    setSelectedStatus(currentRecord?.status || 'PRESENT');
    setNote(currentRecord?.note || '');
  }, [currentRecord, isOpen, dateStr]);

  const dateObj = new Date(dateStr + 'T00:00:00');
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const handleSave = () => {
    onSave(selectedStatus, note.trim() || undefined);
    onClose();
  };

  const handleClear = () => {
    onRemove();
    onClose();
  };

  return (
    <HearthModalShell
      isOpen={isOpen}
      onClose={onClose}
      title={staff.name}
      subtitle={`Attendance for ${formattedDate}`}
      footer={
        <Flex align="center" justify="space-between" gap="10px">
          {currentRecord ? (
            <Button
              type="button"
              variant="ghost"
              onClick={handleClear}
              display="inline-flex"
              alignItems="center"
              gap="7px"
              p="10px 4px"
              h="auto"
              fontFamily="'Instrument Sans', system-ui, sans-serif"
              fontSize="13px"
              fontWeight={600}
              color="#B4403A"
              _hover={{
                textDecoration: 'underline',
                bg: 'transparent',
              }}
            >
              <TrashIcon size={14} strokeWidth={1.9} />
              Clear
            </Button>
          ) : (
            <Box />
          )}

          <HStack gap="9px" ml="auto">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              px="17px"
              py="11px"
              h="auto"
              borderRadius="999px"
              border="1px solid var(--hh-line)"
              bg="var(--hh-cardHover)"
              fontFamily="'Instrument Sans', system-ui, sans-serif"
              fontSize="13.5px"
              fontWeight={600}
              color="var(--hh-ink)"
              _hover={{
                borderColor: 'var(--hh-muted)',
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              px="20px"
              py="11px"
              h="auto"
              borderRadius="999px"
              border="none"
              bg="var(--hh-accent)"
              color="#FFFFFF"
              fontFamily="'Instrument Sans', system-ui, sans-serif"
              fontSize="13.5px"
              fontWeight={600}
              transition="transform 170ms ease, opacity 200ms ease"
              _hover={{
                transform: 'translateY(-1px)',
                opacity: 0.92,
              }}
            >
              Save
            </Button>
          </HStack>
        </Flex>
      }
    >
      <VStack gap="8px" align="stretch">
        {ORDERED_STATUSES.map((statusKey) => {
          const cfg = STATUS_CONFIGS[statusKey];
          const isSelected = selectedStatus === statusKey;

          return (
            <Button
              key={statusKey}
              type="button"
              variant="ghost"
              onClick={() => setSelectedStatus(statusKey)}
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              gap="11px"
              w="100%"
              p="13px 14px"
              h="auto"
              borderRadius="14px"
              cursor="pointer"
              border="1px solid"
              borderColor={isSelected ? 'var(--hh-accent)' : 'var(--hh-line)'}
              bg={isSelected ? 'var(--hh-accentSoft)' : 'var(--hh-cardHover)'}
              color="var(--hh-ink)"
              transition="border-color 180ms ease, background 180ms ease"
              textAlign="left"
              _hover={{
                borderColor: 'var(--hh-accent)',
                bg: isSelected ? 'var(--hh-accentSoft)' : 'var(--hh-card)',
              }}
            >
              <Text
                as="span"
                flex="none"
                w="22px"
                textAlign="center"
                fontFamily="'Instrument Sans', system-ui, sans-serif"
                fontSize="14px"
                fontWeight={700}
                lineHeight="1"
                color={cfg.color}
                m={0}
              >
                {cfg.glyph}
              </Text>
              <Text
                as="span"
                flex="1"
                fontFamily="'Instrument Sans', system-ui, sans-serif"
                fontSize="14px"
                fontWeight={500}
                color="var(--hh-ink)"
                m={0}
              >
                {cfg.label}
              </Text>
              <Box
                flex="none"
                w="9px"
                h="9px"
                borderRadius="50%"
                bg={isSelected ? 'var(--hh-accent)' : 'transparent'}
                border={isSelected ? 'none' : '1px solid var(--hh-line)'}
              />
            </Button>
          );
        })}

        <Box mt="6px">
          <Input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Note / reason (optional)"
            w="100%"
            p="12px 13px"
            h="auto"
            borderRadius="13px"
            border="1px solid var(--hh-line)"
            bg="var(--hh-cardHover)"
            fontFamily="'Instrument Sans', system-ui, sans-serif"
            fontSize="13.5px"
            color="var(--hh-ink)"
            _focus={{
              outline: '2px solid var(--hh-accent)',
              outlineOffset: '1px',
            }}
          />
        </Box>
      </VStack>
    </HearthModalShell>
  );
};
