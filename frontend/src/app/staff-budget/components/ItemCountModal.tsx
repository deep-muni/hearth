'use client';

import React, { useState } from 'react';
import { Box, Flex, HStack, VStack, Text, SimpleGrid, Button, Input } from '@chakra-ui/react';
import { AttendanceRecord, StaffMember } from '../types';
import { HearthModalShell } from './modals/HearthModalShell';
import { TrashIcon } from '@/components/icons';
import { formatCurrency } from '@/utils/dateUtils';

interface ItemCountModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff: StaffMember;
  dateStr: string;
  currentRecord?: AttendanceRecord;
  onSave: (count: number, note?: string, customRate?: number) => void;
  onRemove: () => void;
}

export const ItemCountModal: React.FC<ItemCountModalProps> = ({
  isOpen,
  onClose,
  staff,
  dateStr,
  currentRecord,
  onSave,
  onRemove,
}) => {
  const defaultRate = staff.ratePerItem ?? staff.baseSalary ?? 0;
  const unitLabel = staff.itemUnitName || 'clothes';

  const [count, setCount] = useState<string>(() =>
    currentRecord?.itemCount !== undefined ? String(currentRecord.itemCount) : ''
  );
  const [rate, setRate] = useState<string>(() =>
    currentRecord?.customRate !== undefined ? String(currentRecord.customRate) : String(defaultRate)
  );
  const [note, setNote] = useState<string>(() => currentRecord?.note || '');

  const numCount = Math.max(0, Number(count) || 0);
  const numRate = Math.max(0, Number(rate) || 0);
  const totalCost = Math.round(numCount * numRate);

  const dateObj = new Date(dateStr + 'T00:00:00');
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const handleSave = () => {
    onSave(numCount, note.trim() || undefined, numRate !== defaultRate ? numRate : undefined);
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
      subtitle={`Record count & cost for ${formattedDate}`}
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
      <VStack gap="16px" align="stretch">
        <SimpleGrid columns={2} gap="12px">
          <Box>
            <Text
              as="label"
              display="block"
              fontFamily="'Instrument Sans', system-ui, sans-serif"
              fontSize="12px"
              fontWeight={600}
              letterSpacing="0.02em"
              color="var(--hh-muted)"
              mb="7px"
            >
              Count ({unitLabel})
            </Text>
            <Input
              type="number"
              min="0"
              step="any"
              value={count}
              onChange={(e) => setCount(e.target.value)}
              placeholder="e.g. 8"
              w="100%"
              p="12px 13px"
              h="auto"
              borderRadius="13px"
              border="1px solid var(--hh-line)"
              bg="var(--hh-cardHover)"
              fontFamily="'Instrument Sans', system-ui, sans-serif"
              fontSize="15px"
              fontWeight={600}
              color="var(--hh-ink)"
              _focus={{
                outline: '2px solid var(--hh-accent)',
                outlineOffset: '1px',
              }}
              autoFocus
            />
          </Box>

          <Box>
            <Text
              as="label"
              display="block"
              fontFamily="'Instrument Sans', system-ui, sans-serif"
              fontSize="12px"
              fontWeight={600}
              letterSpacing="0.02em"
              color="var(--hh-muted)"
              mb="7px"
            >
              Rate per item (₹)
            </Text>
            <Input
              type="number"
              min="0"
              step="any"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              placeholder="e.g. 8"
              w="100%"
              p="12px 13px"
              h="auto"
              borderRadius="13px"
              border="1px solid var(--hh-line)"
              bg="var(--hh-cardHover)"
              fontFamily="'Instrument Sans', system-ui, sans-serif"
              fontSize="15px"
              fontWeight={600}
              color="var(--hh-ink)"
              _focus={{
                outline: '2px solid var(--hh-accent)',
                outlineOffset: '1px',
              }}
            />
          </Box>
        </SimpleGrid>

        <Flex
          align="baseline"
          justify="space-between"
          gap="12px"
          p="14px 16px"
          borderRadius="14px"
          bg="var(--hh-accentSoft)"
        >
          <Text
            fontFamily="'Instrument Sans', system-ui, sans-serif"
            fontSize="13px"
            fontWeight={500}
            color="var(--hh-accentInk)"
            m={0}
          >
            Total for {formattedDate}
          </Text>
          <Text
            fontFamily="'Instrument Serif', Georgia, serif"
            fontSize="24px"
            lineHeight="1"
            color="var(--hh-accentInk)"
            m={0}
          >
            {formatCurrency(totalCost)}
          </Text>
        </Flex>

        <Box>
          <Text
            as="label"
            display="block"
            fontFamily="'Instrument Sans', system-ui, sans-serif"
            fontSize="12px"
            fontWeight={600}
            color="var(--hh-muted)"
            mb="7px"
          >
            Note (optional)
          </Text>
          <Input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. 5 shirts, 2 bedsheets"
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
