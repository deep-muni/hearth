"use client";

import React from 'react';
import { Box, Flex, HStack, VStack, Text } from '@chakra-ui/react';
import { HelperSalaryCalculation } from '@/types';
import { formatCurrency } from '@/utils/dateUtils';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

import { normalizeSalaryType } from '@/utils/salaryCalculator';

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
  const { helper, monthName, adjustment } = calculation;
  const normalizedType = normalizeSalaryType(helper.salaryType);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <HStack gap={2}>
          <span>{helper.avatarEmoji}</span>
          <span>{helper.name}</span>
        </HStack>
      }
      description={`${monthName} • ${helper.role}`}
      maxWidth="340px"
    >
      {/* Itemized Breakdown Box */}
      <Card variant="subtle" style={{ padding: '12px', marginBottom: '12px' }}>
        <VStack gap={1.5} align="stretch" fontSize="11px">
          {normalizedType === 'DAYS_LEAVES' && (
            <>
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
            </>
          )}

          {normalizedType === 'FIXED' && (
            <>
              <Flex justify="space-between" color="#64748b">
                <Text>Salary Model:</Text>
                <Text fontWeight="600" color="#0f172a">Fixed Monthly Pay</Text>
              </Flex>

              <Flex justify="space-between">
                <Text color="#64748b">Base Salary:</Text>
                <Text fontWeight="600" color="#0f172a">{formatCurrency(calculation.baseAmount)}</Text>
              </Flex>
            </>
          )}

          {normalizedType === 'COUNT_BASED' && (
            <>
              <Flex justify="space-between" color="#64748b">
                <Text>Total {calculation.itemUnitName} given:</Text>
                <Text fontWeight="700" color="#0f172a">{calculation.totalItemCount} {calculation.itemUnitName}</Text>
              </Flex>

              <Flex justify="space-between" color="#64748b">
                <Text>Rate per {calculation.itemUnitName.replace(/s$/, '')}:</Text>
                <Text fontWeight="600" color="#0f172a">{formatCurrency(calculation.ratePerItem)}</Text>
              </Flex>

              <Box borderTop="1px dashed #e2e8f0" my={0.5} />

              <Flex justify="space-between">
                <Text color="#64748b">Total Earned:</Text>
                <Text fontWeight="700" color="#0f172a">{formatCurrency(calculation.baseAmount)}</Text>
              </Flex>
            </>
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
      </Card>

      {/* Footer */}
      <Flex justify="flex-end" align="center">
        <Button variant="primary" size="sm" onClick={onClose}>
          Done
        </Button>
      </Flex>
    </Modal>
  );
};
