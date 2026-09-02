"use client";

import React, { useState } from 'react';
import {
  Box,
  Flex,
  HStack,
  VStack,
  Text,
} from '@chakra-ui/react';
import { AttendanceRecord, AttendanceStatus, HouseHelp } from '@/types';
import {
  Check,
  X as XIcon,
  Minus,
  Gift,
  Coffee,
  Trash2,
} from 'lucide-react';

interface DayDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  helper: HouseHelp;
  dateStr: string;
  currentRecord?: AttendanceRecord;
  onSave: (status: AttendanceStatus, note?: string) => void;
  onRemove: () => void;
}

const STATUS_ITEMS = [
  { status: 'PRESENT' as const, label: 'Present', icon: Check, color: '#10b981' },
  { status: 'FULL_LEAVE' as const, label: 'Full Day Leave', icon: XIcon, color: '#ef4444' },
  { status: 'HALF_LEAVE' as const, label: 'Half Day Leave', icon: Minus, color: '#f59e0b' },
  { status: 'PAID_LEAVE' as const, label: 'Paid Leave', icon: Gift, color: '#8b5cf6' },
  { status: 'WEEKLY_OFF' as const, label: 'Weekly Off', icon: Coffee, color: '#94a3b8' },
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
  const [selectedStatus, setSelectedStatus] = useState<AttendanceStatus>(currentRecord?.status || 'PRESENT');
  const [note, setNote] = useState<string>(currentRecord?.note || '');

  if (!isOpen) return null;

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
    <Box
      position="fixed"
      inset={0}
      bg="rgba(15, 23, 42, 0.4)"
      backdropFilter="blur(4px)"
      display="flex"
      alignItems={{ base: 'flex-end', sm: 'center' }}
      justifyContent="center"
      zIndex={100}
      p={{ base: 0, sm: 4 }}
    >
      <Box
        bg="#ffffff"
        borderRadius={{ base: '24px 24px 0 0', sm: '20px' }}
        maxW="360px"
        w="100%"
        p={4}
        boxShadow="0 20px 40px rgba(0,0,0,0.12)"
        border="1px solid #e2e8f0"
      >
        {/* Header */}
        <Flex justify="space-between" align="center" mb={3}>
          <Box>
            <Text fontSize="13px" fontWeight="700" color="#0f172a">
              {helper.name}
            </Text>
            <Text fontSize="11px" color="#64748b">
              {formattedDate}
            </Text>
          </Box>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#94a3b8',
              padding: '4px',
            }}
          >
            <XIcon size={16} />
          </button>
        </Flex>

        {/* Status List */}
        <VStack gap={1.5} align="stretch" mb={3}>
          {STATUS_ITEMS.map(({ status, label, icon: Icon, color }) => {
            const isSelected = selectedStatus === status;
            return (
              <Box
                key={status}
                onClick={() => setSelectedStatus(status)}
                p={2.5}
                borderRadius="lg"
                bg={isSelected ? '#f8fafc' : '#ffffff'}
                border="1px solid"
                borderColor={isSelected ? '#0f172a' : '#f1f5f9'}
                cursor="pointer"
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <HStack gap={2.5}>
                  <Icon size={14} color={color} strokeWidth={2.5} />
                  <Text fontSize="12px" fontWeight={isSelected ? '600' : '400'} color="#0f172a">
                    {label}
                  </Text>
                </HStack>
                {isSelected && (
                  <Box w="5px" h="5px" borderRadius="full" bg="#0f172a" />
                )}
              </Box>
            );
          })}
        </VStack>

        {/* Note input */}
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Note / reason (optional)"
          style={{
            width: '100%',
            padding: '7px 10px',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            fontSize: '11px',
            outline: 'none',
            marginBottom: '12px',
          }}
        />

        {/* Actions */}
        <Flex justify="space-between" align="center">
          {currentRecord ? (
            <button
              onClick={handleClear}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
                background: 'transparent',
                border: 'none',
                color: '#ef4444',
                fontSize: '11px',
                fontWeight: '500',
                cursor: 'pointer',
              }}
            >
              <Trash2 size={12} />
              <span>Reset</span>
            </button>
          ) : (
            <Box />
          )}

          <HStack gap={1.5}>
            <button
              onClick={onClose}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                background: '#ffffff',
                fontSize: '11px',
                fontWeight: '500',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: 'none',
                background: '#0f172a',
                color: '#ffffff',
                fontSize: '11px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Save
            </button>
          </HStack>
        </Flex>
      </Box>
    </Box>
  );
};
