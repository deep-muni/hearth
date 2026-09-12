'use client';

import React from 'react';
import { Flex, Text, Button, VStack } from '@chakra-ui/react';
import { StaffSalaryCalculation } from '../types';
import { formatCurrency, formatMonthDisplay } from '@/utils/dateUtils';
import { normalizeSalaryType } from '../utils/salaryCalculator';
import { HearthModalShell } from './modals/HearthModalShell';

interface PaySlipModalProps {
  isOpen: boolean;
  onClose: () => void;
  calculation: StaffSalaryCalculation;
}

export const PaySlipModal: React.FC<PaySlipModalProps> = ({ isOpen, onClose, calculation }) => {
  const staffMember = calculation.staff;
  const { month, adjustment } = calculation;
  const normalizedType = normalizeSalaryType(staffMember.salaryType);
  const monthName = formatMonthDisplay(month);

  const rows: { label: string; value: string }[] = [];

  if (normalizedType === 'COUNT_BASED') {
    const unit = calculation.itemUnitName || 'clothes';
    rows.push({ label: `Total ${unit} given`, value: String(calculation.totalItemCount) });
    rows.push({
      label: `Rate per ${unit.replace(/s$/, '')}`,
      value: formatCurrency(calculation.ratePerItem),
    });
    rows.push({ label: 'Total earned', value: formatCurrency(calculation.baseAmount) });
  } else if (normalizedType === 'FIXED') {
    rows.push({ label: 'Salary model', value: 'Fixed flat monthly' });
    rows.push({ label: 'Monthly base', value: formatCurrency(calculation.baseAmount) });
  } else {
    rows.push({ label: 'Monthly base', value: formatCurrency(calculation.baseAmount) });
    rows.push({ label: 'Days worked', value: `${calculation.daysPresent}d` });
    rows.push({
      label: 'Leave deductions',
      value: calculation.deductions > 0 ? `-${formatCurrency(calculation.deductions)}` : '₹0',
    });
  }

  if (calculation.bonus > 0) {
    rows.push({ label: 'Bonus added', value: `+${formatCurrency(calculation.bonus)}` });
  }
  if (calculation.advanceDeduction > 0) {
    rows.push({
      label: 'Advance deduction',
      value: `-${formatCurrency(calculation.advanceDeduction)}`,
    });
  }

  const isPaid = adjustment.isPaid;

  return (
    <HearthModalShell
      isOpen={isOpen}
      onClose={onClose}
      title={staffMember.name}
      subtitle={`${monthName} · ${staffMember.role}`}
      footer={
        <Flex justify="flex-end">
          <Button
            type="button"
            onClick={onClose}
            px="24px"
            py="11px"
            h="auto"
            borderRadius="999px"
            border="none"
            bg="var(--hh-ink)"
            color="var(--hh-paper)"
            fontFamily="'Instrument Sans', system-ui, sans-serif"
            fontSize="13.5px"
            fontWeight={600}
            _hover={{
              opacity: 0.9,
            }}
          >
            Done
          </Button>
        </Flex>
      }
    >
      <VStack gap="2px" p="18px" borderRadius="16px" bg="var(--hh-sunken)" align="stretch">
        {rows.map((row, idx) => (
          <Flex
            key={idx}
            align="baseline"
            justify="space-between"
            gap="12px"
            py="9px"
            borderBottom="1px dashed var(--hh-line)"
          >
            <Text
              fontFamily="'Instrument Sans', system-ui, sans-serif"
              fontSize="13px"
              color="var(--hh-muted)"
              m={0}
            >
              {row.label}
            </Text>
            <Text
              fontFamily="'Instrument Sans', system-ui, sans-serif"
              fontSize="13.5px"
              fontWeight={600}
              color="var(--hh-ink)"
              m={0}
            >
              {row.value}
            </Text>
          </Flex>
        ))}

        <Flex align="baseline" justify="space-between" gap="12px" pt="14px" pb="4px">
          <Text
            fontFamily="'Instrument Sans', system-ui, sans-serif"
            fontSize="13px"
            fontWeight={600}
            color="var(--hh-ink)"
            m={0}
          >
            Net payable
          </Text>
          <Text
            fontFamily="'Instrument Serif', Georgia, serif"
            fontSize="27px"
            lineHeight="1"
            color="var(--hh-ink)"
            m={0}
          >
            {formatCurrency(calculation.netPayable)}
          </Text>
        </Flex>

        <Flex align="baseline" justify="space-between" gap="12px">
          <Text
            fontFamily="'Instrument Sans', system-ui, sans-serif"
            fontSize="12.5px"
            color="var(--hh-muted)"
            m={0}
          >
            Status
          </Text>
          <Text
            fontFamily="'Instrument Sans', system-ui, sans-serif"
            fontSize="12.5px"
            fontWeight={600}
            color={isPaid ? '#3F7A57' : 'var(--hh-accentInk)'}
            m={0}
          >
            {isPaid ? 'Paid' : 'Pending'}
          </Text>
        </Flex>
      </VStack>
    </HearthModalShell>
  );
};
