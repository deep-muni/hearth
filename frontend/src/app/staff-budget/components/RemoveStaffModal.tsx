'use client';

import React from 'react';
import { Box, Flex, Text, Button, VStack } from '@chakra-ui/react';
import { HearthModalShell } from './modals/HearthModalShell';
import { RoleIcon } from '@/components/icons';
import { StaffMember } from '../types';
import { formatCurrency } from '@/utils/dateUtils';
import { normalizeSalaryType } from '../utils/salaryCalculator';

export interface RemoveStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  staff?: StaffMember;
  isPermanent?: boolean;
  currentMonth?: string;
}

export const RemoveStaffModal: React.FC<RemoveStaffModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  staff,
  isPermanent = false,
  currentMonth,
}) => {
  if (!staff) return null;
  const member = staff;
  const normalizedType = normalizeSalaryType(staff.salaryType);
  const payLabel =
    normalizedType === 'COUNT_BASED'
      ? `${formatCurrency(staff.ratePerItem ?? staff.baseSalary)} / ${staff.itemUnitName || 'item'}`
      : `${formatCurrency(staff.baseSalary)}/mo`;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <HearthModalShell
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="420px"
      title={isPermanent ? 'Delete permanently?' : `Remove ${member.name}?`}
      subtitle={
        isPermanent
          ? 'Irreversible database action'
          : `Deactivate for future months from ${currentMonth || 'current period'}`
      }
      footer={
        <Flex justify="flex-end" gap="10px" w="100%">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            borderRadius="999px"
            px="18px"
            py="10px"
            h="auto"
            border="1px solid var(--hh-line)"
            bg="var(--hh-card)"
            color="var(--hh-muted)"
            fontFamily="'Instrument Sans', system-ui, sans-serif"
            fontSize="13.5px"
            fontWeight={500}
            transition="color 160ms ease, background 160ms ease"
            _hover={{
              color: 'var(--hh-ink)',
              bg: 'var(--hh-cardHover)',
            }}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            borderRadius="999px"
            px="18px"
            py="10px"
            h="auto"
            border="none"
            bg="#b4403a"
            color="#ffffff"
            fontFamily="'Instrument Sans', system-ui, sans-serif"
            fontSize="13.5px"
            fontWeight={600}
            boxShadow="0 2px 6px rgba(180, 64, 58, 0.28)"
            transition="transform 160ms ease, background 160ms ease"
            _hover={{
              bg: '#9e342f',
              transform: 'translateY(-1px)',
            }}
          >
            {isPermanent ? 'Delete Permanently' : 'Remove Staff'}
          </Button>
        </Flex>
      }
    >
      <VStack gap="16px" align="stretch">
        {/* Staff preview banner */}
        <Flex
          align="center"
          gap="12px"
          p="12px 14px"
          borderRadius="16px"
          bg="var(--hh-sunken)"
          border="1px solid var(--hh-line)"
        >
          <Box
            w="40px"
            h="40px"
            borderRadius="12px"
            bg="var(--hh-card)"
            color="var(--hh-accentInk)"
            border="1px solid var(--hh-line)"
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexShrink={0}
          >
            <RoleIcon name={member.role} size={20} />
          </Box>
          <Box minW="0">
            <Text
              fontFamily="'Instrument Sans', system-ui, sans-serif"
              fontSize="14.5px"
              fontWeight={600}
              color="var(--hh-ink)"
              m={0}
            >
              {member.name}
            </Text>
            <Text
              fontFamily="'Instrument Sans', system-ui, sans-serif"
              fontSize="12.5px"
              color="var(--hh-muted)"
              m={0}
            >
              {member.role} · {payLabel}
            </Text>
          </Box>
        </Flex>

        {/* Explanation text */}
        <Box
          p="14px 16px"
          borderRadius="14px"
          bg="var(--hh-cardHover)"
          border="1px solid var(--hh-line)"
        >
          {isPermanent ? (
            <Text
              fontFamily="'Instrument Sans', system-ui, sans-serif"
              fontSize="13px"
              lineHeight="1.55"
              color="var(--hh-ink)"
              m={0}
            >
              This will permanently erase <strong>{member.name}</strong> and all linked attendance
              entries, daily logs, and adjustment calculations forever.{' '}
              <span style={{ color: '#b4403a', fontWeight: 600 }}>This cannot be undone.</span>
            </Text>
          ) : (
            <VStack align="stretch" gap="8px">
              <Text
                fontFamily="'Instrument Sans', system-ui, sans-serif"
                fontSize="13px"
                lineHeight="1.55"
                color="var(--hh-ink)"
                m={0}
              >
                Are you sure you want to remove <strong>{member.name}</strong>?
              </Text>
              <Text
                fontFamily="'Instrument Sans', system-ui, sans-serif"
                fontSize="12px"
                lineHeight="1.5"
                color="var(--hh-muted)"
                m={0}
              >
                Past attendance, notes, and previous monthly salary slips will remain fully
                preserved and accessible under the Former Staff section.
              </Text>
            </VStack>
          )}
        </Box>
      </VStack>
    </HearthModalShell>
  );
};
