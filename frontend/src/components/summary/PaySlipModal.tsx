"use client";

import React from 'react';
import {
  Box,
  Flex,
  HStack,
  VStack,
  Text,
} from '@chakra-ui/react';
import { HelperSalaryCalculation } from '@/types';
import { formatCurrency } from '@/utils/dateUtils';
import { X, Printer } from 'lucide-react';

interface PaySlipModalProps {
  isOpen: boolean;
  onClose: () => void;
  calculation: HelperSalaryCalculation;
}

export const PaySlipModal: React.FC<PaySlipModalProps> = ({
  isOpen,
  onClose,
  calculation,
}) => {
  if (!isOpen) return null;

  const { helper, monthName, adjustment } = calculation;

  return (
    <Box
      position="fixed"
      inset={0}
      bg="rgba(15, 23, 42, 0.45)"
      backdropFilter="blur(3px)"
      display="flex"
      alignItems="center"
      justifyContent="center"
      zIndex={100}
      p={3}
    >
      <Box
        bg="#ffffff"
        borderRadius="2xl"
        maxW="380px"
        w="100%"
        p={5}
        boxShadow="0 20px 40px rgba(0,0,0,0.15)"
        border="1px solid #fed7e2"
      >
        {/* Header */}
        <Flex justify="space-between" align="center" mb={3}>
          <HStack gap={2}>
            <Text fontSize="20px">{helper.avatarEmoji}</Text>
            <Box>
              <Text fontSize="sm" fontWeight="800" color="#1e293b">
                {helper.name} • Pay Slip
              </Text>
              <Text fontSize="11px" color="#64748b">
                {monthName} ({helper.role})
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

        {/* Breakdown Box */}
        <VStack
          gap={2}
          align="stretch"
          p={3.5}
          borderRadius="xl"
          bg="#f8fafc"
          border="1px solid #f1f5f9"
          fontSize="12px"
          mb={4}
        >
          <Flex justify="space-between">
            <Text color="#64748b">Working days present:</Text>
            <Text fontWeight="700">{calculation.daysPresent} days</Text>
          </Flex>

          <Flex justify="space-between">
            <Text color="#64748b">Leaves taken:</Text>
            <Text fontWeight="700">
              {calculation.totalLeavesCount} ({calculation.deductibleLeavesCount} deducted)
            </Text>
          </Flex>

          <Box borderTop="1px dashed #e2e8f0" my={1} />

          <Flex justify="space-between">
            <Text color="#64748b">Base Salary:</Text>
            <Text fontWeight="700">{formatCurrency(calculation.baseAmount)}</Text>
          </Flex>

          {calculation.deductions > 0 && (
            <Flex justify="space-between" color="#e11d48">
              <Text>Leave Deduction:</Text>
              <Text fontWeight="700">-{formatCurrency(calculation.deductions)}</Text>
            </Flex>
          )}

          {calculation.bonus > 0 && (
            <Flex justify="space-between" color="#059669">
              <Text>Bonus:</Text>
              <Text fontWeight="700">+{formatCurrency(calculation.bonus)}</Text>
            </Flex>
          )}

          {calculation.advanceDeduction > 0 && (
            <Flex justify="space-between" color="#d97706">
              <Text>Advance Deduction:</Text>
              <Text fontWeight="700">-{formatCurrency(calculation.advanceDeduction)}</Text>
            </Flex>
          )}

          <Box borderTop="1.5px solid #cbd5e1" my={1} />

          <Flex justify="space-between" align="center">
            <Text fontWeight="800" color="#0f172a">
              Net Payable:
            </Text>
            <Text fontSize="md" fontWeight="900" color="#e11d48">
              {formatCurrency(calculation.netPayable)}
            </Text>
          </Flex>

          <Box pt={1} textAlign="center">
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: adjustment.isPaid ? '#047857' : '#b45309',
              }}
            >
              {adjustment.isPaid ? `Paid via ${adjustment.paymentMethod || 'Cash'} ✅` : 'Pending Payout ⏳'}
            </span>
          </Box>
        </VStack>

        {/* Footer */}
        <Flex justify="space-between" align="center">
          <button
            onClick={() => window.print()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              fontSize: '11px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            <Printer size={13} />
            <span>Print</span>
          </button>

          <button
            onClick={onClose}
            style={{
              padding: '6px 16px',
              borderRadius: '8px',
              border: 'none',
              background: '#e11d48',
              color: '#ffffff',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
            }}
          >
            Close
          </button>
        </Flex>
      </Box>
    </Box>
  );
};
