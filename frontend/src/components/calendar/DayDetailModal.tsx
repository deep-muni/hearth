"use client";

import React, { useState } from 'react';
import { Box, HStack, VStack, Text } from '@chakra-ui/react';
import { AttendanceRecord, AttendanceStatus, HouseHelp } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { STATUS_CONFIGS } from '@/constants';
import { Trash2 } from 'lucide-react';

interface DayDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  helper: HouseHelp;
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
  helper,
  dateStr,
  currentRecord,
  onSave,
  onRemove,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<AttendanceStatus>(
    currentRecord?.status || 'PRESENT'
  );
  const [note, setNote] = useState<string>(currentRecord?.note || '');

  const dateObj = new Date(dateStr + 'T00:00:00');
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const handleSave = () => {
    onSave(selectedStatus, note.trim());
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
      title={`${helper.name} • ${formattedDate}`}
      description="Select attendance status for this date"
      maxWidth="350px"
    >
      <VStack gap={1.5} align="stretch" mb={3}>
        {ORDERED_STATUSES.map((statusKey) => {
          const cfg = STATUS_CONFIGS[statusKey];
          const Icon = cfg.icon;
          const isSelected = selectedStatus === statusKey;

          return (
            <Box
              key={statusKey}
              onClick={() => setSelectedStatus(statusKey)}
              p={2.5}
              borderRadius="lg"
              bg={isSelected ? '#f8fafc' : '#ffffff'}
              border="1px solid"
              borderColor={isSelected ? '#0f172a' : '#f1f5f9'}
              cursor="pointer"
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              transition="all 0.1s ease"
            >
              <HStack gap={2.5}>
                <Icon size={14} color={cfg.color} strokeWidth={2.5} />
                <Text fontSize="12px" fontWeight={isSelected ? '600' : '400'} color="#0f172a">
                  {cfg.label}
                </Text>
              </HStack>
              {isSelected && <Box w="5px" h="5px" borderRadius="full" bg="#0f172a" />}
            </Box>
          );
        })}
      </VStack>

      <Box mb={3}>
        <Input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Note / reason (optional)"
        />
      </Box>

      <Box display="flex" justifyContent="space-between" alignItems="center">
        {currentRecord ? (
          <Button
            variant="ghost"
            size="xs"
            onClick={handleClear}
            icon={<Trash2 size={12} color="#ef4444" />}
            style={{ color: '#ef4444' }}
          >
            Reset
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
      </Box>
    </Modal>
  );
};
