"use client";

import React from 'react';
import {
  Box,
  Flex,
  HStack,
  VStack,
  Text,
  Badge,
  SimpleGrid,
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

  const handlePrint = () => {
    window.print();
  };

  return (
    <Box
      position="fixed"
      inset={0}
      bg="rgba(15, 23, 42, 0.6)"
      backdropFilter="blur(5px)"
      display="flex"
      alignItems="center"
      justifyContent="center"
      zIndex={100}
      p={4}
    >
      <Box
        bg="#ffffff"
        borderRadius="3xl"
        boxShadow="0 25px 50px -12px rgba(0, 0, 0, 0.25)"
        border="2px solid #ffd4dc"
        maxW="520px"
        w="100%"
        overflow="hidden"
      >
        {/* Header */}
        <Flex
          bg="linear-gradient(135deg, #fff0f4 0%, #fdf2f8 100%)"
          p={5}
          borderBottom="2px dashed #fbcfe8"
          align="center"
          justify="space-between"
        >
          <HStack gap={3}>
            <Box
              w="44px"
              h="44px"
              borderRadius="xl"
              bg="#ffffff"
              border="2px solid #fbb6ce"
              display="flex"
              alignItems="center"
              justifyContent="center"
              fontSize="24px"
            >
              {helper.avatarEmoji}
            </Box>
            <Box>
              <Text fontSize="lg" fontWeight="800" color="#831843">
                Monthly Salary Receipt
              </Text>
              <Text fontSize="xs" color="#9d174d" fontWeight="600">
                {monthName} • {helper.role}
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

        {/* Content */}
        <VStack p={6} gap={4} align="stretch">
          {/* Helper Details */}
          <Box p={4} borderRadius="2xl" bg="#fffafb" border="1.5px solid #ffe4e6">
            <Flex justify="space-between" align="center" mb={2}>
              <Text fontSize="md" fontWeight="800" color="#1e293b">
                {helper.name}
              </Text>
              <Badge
                bg={adjustment.isPaid ? '#ecfdf5' : '#fffbeb'}
                color={adjustment.isPaid ? '#047857' : '#b45309'}
                border="1px solid"
                borderColor={adjustment.isPaid ? '#a7f3d0' : '#fde68a'}
                borderRadius="full"
                px={2}
                py={0.5}
                fontSize="xs"
                fontWeight="700"
              >
                {adjustment.isPaid ? `Paid via ${adjustment.paymentMethod || 'Cash'} ✅` : 'Payment Pending ⏳'}
              </Badge>
            </Flex>
            {helper.phone && (
              <Text fontSize="xs" color="#64748b">
                Phone: {helper.phone}
              </Text>
            )}
            <Text fontSize="xs" color="#64748b">
              Salary Type: {helper.salaryType === 'FIXED_MONTHLY' ? 'Fixed Monthly' : helper.salaryType === 'DAILY_WAGE' ? 'Daily Wage' : 'Flat Monthly'}
            </Text>
          </Box>

          {/* Attendance Breakdown */}
          <SimpleGrid columns={3} gap={2} textAlign="center">
            <Box p={2.5} borderRadius="xl" bg="#f0fdf4" border="1px solid #bbf7d0">
              <Text fontSize="10px" fontWeight="700" color="#166534" textTransform="uppercase">
                Days Present
              </Text>
              <Text fontSize="md" fontWeight="800" color="#14532d">
                {calculation.daysPresent}
              </Text>
            </Box>
            <Box p={2.5} borderRadius="xl" bg="#fff1f2" border="1px solid #fecdd3">
              <Text fontSize="10px" fontWeight="700" color="#9f1239" textTransform="uppercase">
                Leaves Taken
              </Text>
              <Text fontSize="md" fontWeight="800" color="#881337">
                {calculation.totalLeavesCount}
              </Text>
            </Box>
            <Box p={2.5} borderRadius="xl" bg="#f5f3ff" border="1px solid #ddd6fe">
              <Text fontSize="10px" fontWeight="700" color="#5b21b6" textTransform="uppercase">
                Paid Leaves
              </Text>
              <Text fontSize="md" fontWeight="800" color="#4c1d95">
                {calculation.paidLeavesCount} / {helper.paidLeavesAllowance}
              </Text>
            </Box>
          </SimpleGrid>

          {/* Salary Breakdown Table */}
          <Box p={4} borderRadius="2xl" bg="#ffffff" border="1.5px solid #e2e8f0">
            <VStack gap={2.5} align="stretch" fontSize="13px">
              <Flex justify="space-between">
                <Text color="#475569">Base Salary / Earnings:</Text>
                <Text fontWeight="700" color="#1e293b">
                  {formatCurrency(calculation.baseAmount)}
                </Text>
              </Flex>

              {calculation.deductions > 0 && (
                <Flex justify="space-between">
                  <Text color="#e11d48">
                    Leaves Deduction ({calculation.deductibleLeavesCount} days @ {formatCurrency(calculation.perDayRate)}):
                  </Text>
                  <Text fontWeight="700" color="#e11d48">
                    - {formatCurrency(calculation.deductions)}
                  </Text>
                </Flex>
              )}

              {calculation.bonus > 0 && (
                <Flex justify="space-between">
                  <Text color="#059669">Festival Bonus / Extra Gift (+):</Text>
                  <Text fontWeight="700" color="#059669">
                    + {formatCurrency(calculation.bonus)}
                  </Text>
                </Flex>
              )}

              {calculation.advanceDeduction > 0 && (
                <Flex justify="space-between">
                  <Text color="#d97706">Advance Borrowed / Repayment (-):</Text>
                  <Text fontWeight="700" color="#d97706">
                    - {formatCurrency(calculation.advanceDeduction)}
                  </Text>
                </Flex>
              )}

              <Box borderTop="1.5px dashed #cbd5e1" my={1} />

              <Flex justify="space-between" align="center">
                <Text fontSize="sm" fontWeight="800" color="#0f172a">
                  Final Net Payable:
                </Text>
                <Text fontSize="lg" fontWeight="900" color="#e11d48">
                  {formatCurrency(calculation.netPayable)}
                </Text>
              </Flex>
            </VStack>
          </Box>
        </VStack>

        {/* Footer */}
        <Flex
          p={4}
          bg="#f8fafc"
          borderTop="1px solid #e2e8f0"
          justify="space-between"
          align="center"
        >
          <button
            onClick={handlePrint}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '12px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#334155',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            <Printer size={15} />
            <span>Print Slip</span>
          </button>

          <button
            onClick={onClose}
            style={{
              padding: '8px 20px',
              borderRadius: '12px',
              border: 'none',
              background: '#f43f5e',
              color: '#ffffff',
              fontSize: '13px',
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
