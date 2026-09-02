'use client';

import React from 'react';
import { Box, Flex, HStack, VStack, Text } from '@chakra-ui/react';
import { HelperSalaryCalculation } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { formatCurrency, formatMonthDisplay } from '@/utils/dateUtils';
import { normalizeSalaryType } from '@/utils/salaryCalculator';
import { ReceiptIndianRupee } from 'lucide-react';

interface PaySlipModalProps {
  isOpen: boolean;
  onClose: () => void;
  calculation: HelperSalaryCalculation;
}

export const PaySlipModal: React.FC<PaySlipModalProps> = ({ isOpen, onClose, calculation }) => {
  const { helper, month, adjustment } = calculation;
  const normalizedType = normalizeSalaryType(helper.salaryType);
  const monthName = formatMonthDisplay(month);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <HStack gap={1.5}>
          <ReceiptIndianRupee size={16} color="var(--color-info)" />
          <span>{helper.avatarEmoji}</span>
          <span>{helper.name}</span>
        </HStack>
      }
      description={`${monthName} • ${helper.role}`}
      maxWidth="340px"
    >
      <Card variant="subtle" style={{ padding: '12px', marginBottom: '12px' }}>
        <VStack gap={1.5} align="stretch" fontSize="11px">
          {normalizedType === 'DAYS_LEAVES' && (
            <>
              <Flex justify="space-between" color="var(--text-muted)">
                <Text>Working Days Present:</Text>
                <Text fontWeight="600" color="var(--text-primary)">
                  {calculation.daysPresent} days
                </Text>
              </Flex>

              <Flex justify="space-between" color="var(--text-muted)">
                <Text>Leaves Taken:</Text>
                <Text fontWeight="600" color="var(--text-primary)">
                  {calculation.totalLeavesCount} ({calculation.deductibleLeavesCount} deducted)
                </Text>
              </Flex>

              <Box borderTop="1px dashed var(--border-dashed)" my={0.5} />

              <Flex justify="space-between">
                <Text color="var(--text-muted)">Base Salary:</Text>
                <Text fontWeight="600" color="var(--text-primary)">
                  {formatCurrency(calculation.baseAmount)}
                </Text>
              </Flex>

              {calculation.deductions > 0 && (
                <Flex justify="space-between" color="var(--color-danger)">
                  <Text>Leaves Deduction:</Text>
                  <Text fontWeight="600">-{formatCurrency(calculation.deductions)}</Text>
                </Flex>
              )}
            </>
          )}

          {normalizedType === 'FIXED' && (
            <>
              <Flex justify="space-between" color="var(--text-muted)">
                <Text>Salary Model:</Text>
                <Text fontWeight="600" color="var(--text-primary)">
                  Fixed Monthly Pay
                </Text>
              </Flex>

              <Flex justify="space-between">
                <Text color="var(--text-muted)">Base Salary:</Text>
                <Text fontWeight="600" color="var(--text-primary)">
                  {formatCurrency(calculation.baseAmount)}
                </Text>
              </Flex>
            </>
          )}

          {normalizedType === 'COUNT_BASED' && (
            <>
              <Flex justify="space-between" color="var(--text-muted)">
                <Text>Total {calculation.itemUnitName} given:</Text>
                <Text fontWeight="700" color="var(--text-primary)">
                  {calculation.totalItemCount} {calculation.itemUnitName}
                </Text>
              </Flex>

              <Flex justify="space-between" color="var(--text-muted)">
                <Text>Rate per {calculation.itemUnitName.replace(/s$/, '')}:</Text>
                <Text fontWeight="600" color="var(--text-primary)">
                  {formatCurrency(calculation.ratePerItem)}
                </Text>
              </Flex>

              <Box borderTop="1px dashed var(--border-dashed)" my={0.5} />

              <Flex justify="space-between">
                <Text color="var(--text-muted)">Total Earned:</Text>
                <Text fontWeight="700" color="var(--text-primary)">
                  {formatCurrency(calculation.baseAmount)}
                </Text>
              </Flex>
            </>
          )}

          {calculation.bonus > 0 && (
            <Flex justify="space-between" color="var(--color-success)">
              <Text>Bonus:</Text>
              <Text fontWeight="600">+{formatCurrency(calculation.bonus)}</Text>
            </Flex>
          )}

          {calculation.advanceDeduction > 0 && (
            <Flex justify="space-between" color="var(--color-warning)">
              <Text>Advance Deduction:</Text>
              <Text fontWeight="600">-{formatCurrency(calculation.advanceDeduction)}</Text>
            </Flex>
          )}

          <Box borderTop="1px solid var(--border-color)" my={0.5} />

          <Flex justify="space-between" align="center">
            <Text fontWeight="700" color="var(--text-primary)">
              Net Payable:
            </Text>
            <Text fontSize="sm" fontWeight="800" color="var(--text-primary)">
              {formatCurrency(calculation.netPayable)}
            </Text>
          </Flex>

          <Flex justify="space-between" align="center" fontSize="11px">
            <Text color="var(--text-muted)">Status:</Text>
            <Text
              fontWeight="600"
              color={adjustment.isPaid ? 'var(--color-success)' : 'var(--color-warning)'}
            >
              {adjustment.isPaid ? `Paid (${adjustment.paymentMethod || 'Cash'})` : 'Pending'}
            </Text>
          </Flex>
        </VStack>
      </Card>

      <Flex justify="flex-end" align="center">
        <Button variant="primary" size="sm" onClick={onClose}>
          Done
        </Button>
      </Flex>
    </Modal>
  );
};
