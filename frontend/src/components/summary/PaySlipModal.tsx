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
      bg="rgba(15, 23, 42, 0.4)"
      backdropFilter="blur(4px)"
      display="flex"
      alignItems="center"
      justifyContent="center"
      zIndex={100}
      p={3}
    >
      <Box
        bg="#ffffff"
        borderRadius="20px"
        maxW="340px"
        w="100%"
        p={4}
        boxShadow="0 20px 40px rgba(0,0,0,0.12)"
        border="1px solid #e2e8f0"
      >
        {/* Header */}
        <Flex justify="space-between" align="center" mb={3}>
          <HStack gap={2}>
            <Text fontSize="18px">{helper.avatarEmoji}</Text>
            <Box>
              <Text fontSize="13px" fontWeight="700" color="#0f172a">
                {helper.name}
              </Text>
              <Text fontSize="10px" color="#64748b">
                {monthName} • {helper.role}
              </Text>
            </Box>
          </HStack>

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
            <X size={16} />
          </button>
        </Flex>

        {/* Breakdown Box */}
        <VStack
          gap={1.5}
          align="stretch"
          p={3}
          borderRadius="lg"
          bg="#f8fafc"
          border="1px solid #f1f5f9"
          fontSize="11px"
          mb={3}
        >
          <Flex justify="space-between" color="#64748b">
            <Text>Working Days Present:</Text>
            <Text fontWeight="600" color="#0f172a">{calculation.daysPresent} days</Text>
          </Flex>

          <Flex justify="space-between" color="#64748b">
            <Text>Leaves Taken:</Text>
            <Text fontWeight="600" color="#0f172a">
              {calculation.totalLeavesCount} ({calculation.deductibleLeavesCount} deducted)
            </Text>
          </Flex>

          <Box borderTop="1px dashed #e2e8f0" my={0.5} />

          <Flex justify="space-between">
            <Text color="#64748b">Base Salary:</Text>
            <Text fontWeight="600" color="#0f172a">{formatCurrency(calculation.baseAmount)}</Text>
          </Flex>

          {calculation.deductions > 0 && (
            <Flex justify="space-between" color="#ef4444">
              <Text>Leaves Deduction:</Text>
              <Text fontWeight="600">-{formatCurrency(calculation.deductions)}</Text>
            </Flex>
          )}

          {calculation.bonus > 0 && (
            <Flex justify="space-between" color="#10b981">
              <Text>Bonus:</Text>
              <Text fontWeight="600">+{formatCurrency(calculation.bonus)}</Text>
            </Flex>
          )}

          {calculation.advanceDeduction > 0 && (
            <Flex justify="space-between" color="#f59e0b">
              <Text>Advance Deduction:</Text>
              <Text fontWeight="600">-{formatCurrency(calculation.advanceDeduction)}</Text>
            </Flex>
          )}

          <Box borderTop="1px solid #cbd5e1" my={0.5} />

          <Flex justify="space-between" align="center">
            <Text fontWeight="700" color="#0f172a">
              Net Payable:
            </Text>
            <Text fontSize="sm" fontWeight="800" color="#0f172a">
              {formatCurrency(calculation.netPayable)}
            </Text>
          </Flex>

          <Flex justify="space-between" align="center" fontSize="11px">
            <Text color="#64748b">Status:</Text>
            <Text fontWeight="600" color={adjustment.isPaid ? '#10b981' : '#f59e0b'}>
              {adjustment.isPaid ? `Paid (${adjustment.paymentMethod || 'Cash'})` : 'Pending'}
            </Text>
          </Flex>
        </VStack>

        {/* Footer */}
        <Flex justify="space-between" align="center">
          <button
            onClick={() => window.print()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '5px 10px',
              borderRadius: '6px',
              border: '1px solid #e2e8f0',
              background: '#ffffff',
              fontSize: '11px',
              fontWeight: '500',
              cursor: 'pointer',
              color: '#64748b',
            }}
          >
            <Printer size={12} />
            <span>Print</span>
          </button>

          <button
            onClick={onClose}
            style={{
              padding: '5px 14px',
              borderRadius: '6px',
              border: 'none',
              background: '#0f172a',
              color: '#ffffff',
              fontSize: '11px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Done
          </button>
        </Flex>
      </Box>
    </Box>
  );
};
