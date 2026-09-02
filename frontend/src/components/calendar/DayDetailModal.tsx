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
import { X, Trash2 } from 'lucide-react';

interface DayDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  helper: HouseHelp;
  dateStr: string; // YYYY-MM-DD
  currentRecord?: AttendanceRecord;
  onSave: (status: AttendanceStatus, note?: string) => void;
  onRemove: () => void;
}

const STATUS_LIST: { status: AttendanceStatus; label: string; emoji: string; bg: string; color: string; border: string }[] = [
  { status: 'PRESENT', label: 'Present', emoji: '✅', bg: '#ecfdf5', color: '#065f46', border: '#a7f3d0' },
  { status: 'FULL_LEAVE', label: 'Full Leave', emoji: '🚫', bg: '#fff1f2', color: '#9f1239', border: '#fecdd3' },
  { status: 'HALF_LEAVE', label: 'Half Day', emoji: '🌓', bg: '#fffbeb', color: '#92400e', border: '#fde68a' },
  { status: 'PAID_LEAVE', label: 'Paid Leave', emoji: '🎁', bg: '#f5f3ff', color: '#5b21b6', border: '#ddd6fe' },
  { status: 'WEEKLY_OFF', label: 'Weekly Off', emoji: '☕', bg: '#f1f5f9', color: '#334155', border: '#cbd5e1' },
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
      bg="rgba(15, 23, 42, 0.45)"
      backdropFilter="blur(3px)"
      display="flex"
      alignItems={{ base: 'flex-end', sm: 'center' }}
      justifyContent="center"
      zIndex={100}
      p={{ base: 0, sm: 4 }}
    >
      <Box
        bg="#ffffff"
        borderRadius={{ base: '28px 28px 0 0', sm: '24px' }}
        maxW="400px"
        w="100%"
        p={5}
        boxShadow="0 25px 50px -12px rgba(0,0,0,0.2)"
        border="1px solid #fed7e2"
      >
        {/* Header */}
        <Flex justify="space-between" align="center" mb={3}>
          <HStack gap={2}>
            <Text fontSize="20px">{helper.avatarEmoji}</Text>
            <Box>
              <Text fontSize="sm" fontWeight="800" color="#1e293b">
                {helper.name}
              </Text>
              <Text fontSize="xs" color="#64748b">
                {formattedDate}
              </Text>
            </Box>
          </HStack>

          <button
            onClick={onClose}
            style={{
              background: '#f8fafc',
              border: 'none',
              borderRadius: '9999px',
              padding: '6px',
              cursor: 'pointer',
              color: '#64748b',
            }}
          >
            <X size={16} />
          </button>
        </Flex>

        {/* Status Selection Buttons */}
        <VStack gap={2} align="stretch" mb={4}>
          {STATUS_LIST.map((item) => {
            const isSelected = selectedStatus === item.status;
            return (
              <Box
                key={item.status}
                onClick={() => setSelectedStatus(item.status)}
                p={2.5}
                borderRadius="xl"
                border="1.5px solid"
                borderColor={isSelected ? item.color : '#f1f5f9'}
                bg={isSelected ? item.bg : '#ffffff'}
                cursor="pointer"
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <HStack gap={2.5}>
                  <Text fontSize="16px">{item.emoji}</Text>
                  <Text
                    fontSize="13px"
                    fontWeight={isSelected ? '800' : '500'}
                    color={isSelected ? item.color : '#334155'}
                  >
                    {item.label}
                  </Text>
                </HStack>
                {isSelected && (
                  <Box w="6px" h="6px" borderRadius="full" bg={item.color} />
                )}
              </Box>
            );
          })}
        </VStack>

        {/* Note input */}
        <Box mb={4}>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add note (optional)..."
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              fontSize: '12px',
              outline: 'none',
            }}
          />
        </Box>

        {/* Actions */}
        <Flex justify="space-between" align="center">
          {currentRecord ? (
            <button
              onClick={handleClear}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                background: 'transparent',
                border: 'none',
                color: '#e11d48',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              <Trash2 size={13} />
              <span>Reset</span>
            </button>
          ) : (
            <Box />
          )}

          <HStack gap={2}>
            <button
              onClick={onClose}
              style={{
                padding: '7px 14px',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              style={{
                padding: '7px 18px',
                borderRadius: '10px',
                border: 'none',
                background: '#e11d48',
                color: '#ffffff',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
              }}
            >
              Done
            </button>
          </HStack>
        </Flex>
      </Box>
    </Box>
  );
};
