"use client";

import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  HStack,
  VStack,
  Text,
  Badge,
} from '@chakra-ui/react';
import { AttendanceRecord, AttendanceStatus, HouseHelp } from '@/types';
import { Check, X, Trash2, Calendar as CalIcon, MessageSquare } from 'lucide-react';

interface DayDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  helper: HouseHelp;
  dateStr: string; // YYYY-MM-DD
  currentRecord?: AttendanceRecord;
  onSave: (status: AttendanceStatus, note?: string) => void;
  onRemove: () => void;
}

const STATUS_OPTIONS: {
  status: AttendanceStatus;
  label: string;
  emoji: string;
  badgeBg: string;
  badgeColor: string;
  badgeBorder: string;
  desc: string;
}[] = [
  {
    status: 'PRESENT',
    label: 'Present',
    emoji: '✅',
    badgeBg: '#ecfdf5',
    badgeColor: '#065f46',
    badgeBorder: '#a7f3d0',
    desc: 'Normal working day',
  },
  {
    status: 'FULL_LEAVE',
    label: 'Full Day Leave',
    emoji: '🚫',
    badgeBg: '#fff1f2',
    badgeColor: '#9f1239',
    badgeBorder: '#fecdd3',
    desc: 'Absent for full day (deductible)',
  },
  {
    status: 'HALF_LEAVE',
    label: 'Half Day Leave',
    emoji: '🌓',
    badgeBg: '#fffbeb',
    badgeColor: '#92400e',
    badgeBorder: '#fde68a',
    desc: 'Worked half day (0.5 leave)',
  },
  {
    status: 'PAID_LEAVE',
    label: 'Paid Leave',
    emoji: '🎁',
    badgeBg: '#f5f3ff',
    badgeColor: '#5b21b6',
    badgeBorder: '#ddd6fe',
    desc: 'Approved leave with full pay',
  },
  {
    status: 'WEEKLY_OFF',
    label: 'Weekly Off',
    emoji: '☕',
    badgeBg: '#f1f5f9',
    badgeColor: '#334155',
    badgeBorder: '#cbd5e1',
    desc: 'Regular scheduled off day',
  },
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
  const [selectedStatus, setSelectedStatus] = useState<AttendanceStatus>('PRESENT');
  const [note, setNote] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setSelectedStatus(currentRecord?.status || 'PRESENT');
      setNote(currentRecord?.note || '');
    }
  }, [isOpen, currentRecord]);

  if (!isOpen) return null;

  // Format date display (e.g., "Monday, September 4, 2026")
  const dateObj = new Date(dateStr + 'T00:00:00');
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
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
      bg="rgba(15, 23, 42, 0.55)"
      backdropFilter="blur(4px)"
      display="flex"
      alignItems="center"
      justifyContent="center"
      zIndex={100}
      p={4}
    >
      <Box
        bg="#ffffff"
        borderRadius="3xl"
        boxShadow="0 25px 50px -12px rgba(255, 107, 139, 0.25)"
        border="2px solid #ffd4dc"
        maxW="480px"
        w="100%"
        overflow="hidden"
      >
        {/* Modal Header */}
        <Flex
          bg="linear-gradient(135deg, #fff0f4 0%, #fdf2f8 100%)"
          p={5}
          borderBottom="1px solid #fed7e2"
          align="center"
          justify="space-between"
        >
          <HStack gap={3}>
            <Box
              w="40px"
              h="40px"
              borderRadius="xl"
              bg="#ffffff"
              border="2px solid #fbb6ce"
              display="flex"
              alignItems="center"
              justifyContent="center"
              fontSize="20px"
              boxShadow="sm"
            >
              {helper.avatarEmoji}
            </Box>
            <Box>
              <Text fontSize="lg" fontWeight="800" color="#831843">
                {helper.name}
              </Text>
              <Text fontSize="xs" color="#9d174d" fontWeight="600">
                {formattedDate}
              </Text>
            </Box>
          </HStack>

          <button
            onClick={onClose}
            style={{
              background: '#ffffff',
              border: '1px solid #fecdd3',
              borderRadius: '9999px',
              padding: '6px',
              cursor: 'pointer',
              color: '#9f1239',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <X size={16} />
          </button>
        </Flex>

        {/* Modal Body */}
        <VStack p={5} gap={4} align="stretch">
          <Text fontSize="xs" fontWeight="700" color="#64748b" textTransform="uppercase" letterSpacing="0.5px">
            Select Attendance Status
          </Text>

          <VStack gap={2} align="stretch">
            {STATUS_OPTIONS.map((opt) => {
              const isSelected = selectedStatus === opt.status;
              return (
                <Box
                  key={opt.status}
                  onClick={() => setSelectedStatus(opt.status)}
                  p={3}
                  borderRadius="2xl"
                  border="2px solid"
                  borderColor={isSelected ? opt.badgeColor : '#f1f5f9'}
                  bg={isSelected ? opt.badgeBg : '#ffffff'}
                  cursor="pointer"
                  transition="all 0.15s ease"
                  boxShadow={isSelected ? '0 2px 8px rgba(0,0,0,0.06)' : 'none'}
                  _hover={{ borderColor: opt.badgeBorder, bg: opt.badgeBg }}
                >
                  <Flex align="center" justify="space-between">
                    <HStack gap={3}>
                      <Text fontSize="20px">{opt.emoji}</Text>
                      <Box>
                        <Text
                          fontSize="sm"
                          fontWeight={isSelected ? '800' : '600'}
                          color={isSelected ? opt.badgeColor : '#334155'}
                        >
                          {opt.label}
                        </Text>
                        <Text fontSize="xs" color="#64748b">
                          {opt.desc}
                        </Text>
                      </Box>
                    </HStack>

                    {isSelected && (
                      <Box
                        w="22px"
                        h="22px"
                        borderRadius="full"
                        bg={opt.badgeColor}
                        color="#ffffff"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Check size={14} strokeWidth={3} />
                      </Box>
                    )}
                  </Flex>
                </Box>
              );
            })}
          </VStack>

          {/* Note Input */}
          <Box pt={2}>
            <HStack mb={1.5} gap={1.5} color="#475569">
              <MessageSquare size={14} />
              <Text fontSize="xs" fontWeight="700">
                Leave Note / Reason (Optional)
              </Text>
            </HStack>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Doctor visit, Family function, Advance request..."
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '14px',
                border: '1.5px solid #fed7e2',
                background: '#fffafb',
                fontSize: '13px',
                outline: 'none',
                color: '#2d3748',
              }}
            />
          </Box>
        </VStack>

        {/* Modal Footer */}
        <Flex
          p={4}
          bg="#f8fafc"
          borderTop="1px solid #e2e8f0"
          align="center"
          justify="space-between"
        >
          {currentRecord ? (
            <button
              onClick={handleClear}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'transparent',
                border: 'none',
                color: '#e11d48',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                padding: '6px 12px',
                borderRadius: '10px',
              }}
            >
              <Trash2 size={14} />
              <span>Reset Day</span>
            </button>
          ) : (
            <Box />
          )}

          <HStack gap={2}>
            <button
              onClick={onClose}
              style={{
                padding: '8px 16px',
                borderRadius: '14px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#475569',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>

            <button
              onClick={handleSave}
              style={{
                padding: '8px 20px',
                borderRadius: '14px',
                border: 'none',
                background: 'linear-gradient(135deg, #ec4899 0%, #d946ef 100%)',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer',
                boxShadow: '0 2px 10px rgba(236, 72, 153, 0.35)',
              }}
            >
              Save Changes
            </button>
          </HStack>
        </Flex>
      </Box>
    </Box>
  );
};
