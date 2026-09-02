'use client';

import React, { useState } from 'react';
import { Box, HStack, VStack, Text, Flex, SimpleGrid } from '@chakra-ui/react';
import { AttendanceRecord, HouseHelp } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { formatCurrency } from '@/utils/dateUtils';
import { Trash2 } from 'lucide-react';

interface ItemCountModalProps {
  isOpen: boolean;
  onClose: () => void;
  helper: HouseHelp;
  dateStr: string;
  currentRecord?: AttendanceRecord;
  onSave: (count: number, note?: string, customRate?: number) => void;
  onRemove: () => void;
}

export const ItemCountModal: React.FC<ItemCountModalProps> = ({
  isOpen,
  onClose,
  helper,
  dateStr,
  currentRecord,
  onSave,
  onRemove,
}) => {
  const defaultRate = helper.ratePerItem ?? helper.baseSalary;
  const unitLabel = helper.itemUnitName || 'items';

  const [count, setCount] = useState<string>(
    currentRecord?.itemCount !== undefined ? String(currentRecord.itemCount) : ''
  );
  const [rate, setRate] = useState<string>(
    currentRecord?.customRate !== undefined ? String(currentRecord.customRate) : String(defaultRate)
  );
  const [note, setNote] = useState<string>(currentRecord?.note || '');

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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <HStack gap={1.5}>
          <span>{helper.avatarEmoji}</span>
          <span>{helper.name}</span>
        </HStack>
      }
      description={`Record count & cost for ${formattedDate}`}
      maxWidth="350px"
    >
      <VStack gap={3} align="stretch">
        <SimpleGrid columns={2} gap={2}>
          <Input
            label={`Count (${unitLabel}) *`}
            type="number"
            min="0"
            step="any"
            value={count}
            onChange={(e) => setCount(e.target.value)}
            placeholder="e.g. 5"
            autoFocus
          />

          <Input
            label="Rate per item (₹) *"
            type="number"
            min="0"
            step="any"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            placeholder="e.g. 20"
          />
        </SimpleGrid>

        <Flex
          justify="space-between"
          align="center"
          bg="var(--bg-card-subtle)"
          px={3}
          py={2}
          borderRadius="lg"
          border="1px solid var(--border-color)"
          fontSize="12px"
        >
          <Text color="var(--text-muted)">Total for {formattedDate}:</Text>
          <Text fontWeight="800" color="var(--text-primary)" fontSize="13px">
            {formatCurrency(totalCost)}
          </Text>
        </Flex>

        <Box>
          <Input
            label="Note (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={`Details e.g. "5 shirts, 2 bedsheets"`}
          />
        </Box>

        <Flex justify="space-between" align="center" pt={1}>
          {currentRecord && (currentRecord.itemCount !== undefined || currentRecord.note) ? (
            <Button
              variant="ghost"
              size="xs"
              onClick={handleClear}
              icon={<Trash2 size={12} color="var(--color-danger)" />}
              style={{ color: 'var(--color-danger)' }}
            >
              Clear
            </Button>
          ) : (
            <Box />
          )}

          <HStack gap={1.5}>
            <Button variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSave}>
              Save
            </Button>
          </HStack>
        </Flex>
      </VStack>
    </Modal>
  );
};
