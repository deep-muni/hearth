"use client";

import React, { memo, useState, useEffect } from 'react';
import { Box, Flex, HStack, Text } from '@chakra-ui/react';
import { HelperSalaryCalculation } from '@/types';
import { formatCurrency } from '@/utils/dateUtils';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ReceiptIndianRupee, Check } from 'lucide-react';

import { normalizeSalaryType } from '@/utils/salaryCalculator';

interface SalaryCardProps {
  calculation: HelperSalaryCalculation;
  onTogglePaid: (calc: HelperSalaryCalculation) => void;
  onOpenSlip: (calc: HelperSalaryCalculation) => void;
  onBonusChange: (calc: HelperSalaryCalculation, val: number) => void;
  onAdvanceChange: (calc: HelperSalaryCalculation, val: number) => void;
}

export const SalaryCard: React.FC<SalaryCardProps> = memo(({
  calculation,
  onTogglePaid,
  onOpenSlip,
  onBonusChange,
  onAdvanceChange,
}) => {
  const { helper, adjustment } = calculation;
  const normalizedType = normalizeSalaryType(helper.salaryType);

  const [bonusVal, setBonusVal] = useState<string>(
    calculation.bonus ? String(calculation.bonus) : ''
  );
  const [advanceVal, setAdvanceVal] = useState<string>(
    calculation.advanceDeduction ? String(calculation.advanceDeduction) : ''
  );

  useEffect(() => {
    setBonusVal(calculation.bonus ? String(calculation.bonus) : '');
  }, [calculation.bonus]);

  useEffect(() => {
    setAdvanceVal(calculation.advanceDeduction ? String(calculation.advanceDeduction) : '');
  }, [calculation.advanceDeduction]);

  const handleBonusInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const cleaned = raw.replace(/^0+(?=\d)/, '');
    setBonusVal(cleaned);
    onBonusChange(calculation, Number(cleaned) || 0);
  };

  const handleAdvanceInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const cleaned = raw.replace(/^0+(?=\d)/, '');
    setAdvanceVal(cleaned);
    onAdvanceChange(calculation, Number(cleaned) || 0);
  };

  return (
    <Card style={{ padding: '12px' }}>
      {/* Top Row: Info & Net Pay */}
      <Flex justify="space-between" align="center" mb={1.5}>
        <HStack gap={2}>
          <Text fontSize="16px">{helper.avatarEmoji}</Text>
          <Box>
            <Text fontSize="13px" fontWeight="700" color="#0f172a">
              {helper.name}
            </Text>
            <Text fontSize="10px" color="#94a3b8">
              {normalizedType === 'DAYS_LEAVES' && `${helper.role} • ${calculation.daysPresent}d worked • ${calculation.totalLeavesCount} leaves`}
              {normalizedType === 'FIXED' && `${helper.role} • Fixed Monthly`}
              {normalizedType === 'COUNT_BASED' && `${helper.role} • ${calculation.totalItemCount} ${calculation.itemUnitName} given`}
            </Text>
          </Box>
        </HStack>

        <Box textAlign="right">
          <Text fontSize="14px" fontWeight="800" color="#0f172a">
            {formatCurrency(calculation.netPayable)}
          </Text>
        </Box>
      </Flex>

      {/* Math breakdown line */}
      <Flex
        justify="space-between"
        align="center"
        fontSize="11px"
        color="#64748b"
        bg="#f8fafc"
        px={2}
        py={1}
        borderRadius="md"
        mb={2}
      >
        {normalizedType === 'COUNT_BASED' && (
          <Text>
            {calculation.totalItemCount} {calculation.itemUnitName} × {formatCurrency(calculation.ratePerItem)} = {formatCurrency(calculation.baseAmount)}
          </Text>
        )}
        {normalizedType === 'FIXED' && (
          <Text>Fixed {formatCurrency(calculation.baseAmount)}</Text>
        )}
        {normalizedType === 'DAYS_LEAVES' && (
          <Text>Base {formatCurrency(calculation.baseAmount)}</Text>
        )}

        {calculation.deductions > 0 && (
          <Text color="#ef4444">-{formatCurrency(calculation.deductions)} leaves</Text>
        )}
        {calculation.bonus > 0 && (
          <Text color="#10b981">+{formatCurrency(calculation.bonus)} bonus</Text>
        )}
        {calculation.advanceDeduction > 0 && (
          <Text color="#f59e0b">-{formatCurrency(calculation.advanceDeduction)} advance</Text>
        )}
      </Flex>

      {/* Quick Bonus & Advance Inputs */}
      <HStack gap={1.5} mb={2}>
        <Box flex={1}>
          <input
            type="number"
            min="0"
            step="any"
            value={bonusVal}
            onFocus={(e) => e.target.select()}
            onChange={handleBonusInputChange}
            placeholder="+ Bonus (₹)"
            style={{
              width: '100%',
              padding: '4px 7px',
              borderRadius: '6px',
              border: '1px solid #e2e8f0',
              fontSize: '11px',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </Box>
        <Box flex={1}>
          <input
            type="number"
            min="0"
            step="any"
            value={advanceVal}
            onFocus={(e) => e.target.select()}
            onChange={handleAdvanceInputChange}
            placeholder="- Advance (₹)"
            style={{
              width: '100%',
              padding: '4px 7px',
              borderRadius: '6px',
              border: '1px solid #e2e8f0',
              fontSize: '11px',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </Box>
      </HStack>

      {/* Actions Row */}
      <Flex justify="space-between" align="center" pt={1}>
        <Button
          variant="ghost"
          size="xs"
          onClick={() => onOpenSlip(calculation)}
          icon={<ReceiptIndianRupee size={12} />}
        >
          Pay Slip
        </Button>

        <Button
          variant={adjustment.isPaid ? 'success' : 'primary'}
          size="xs"
          onClick={() => onTogglePaid(calculation)}
          icon={adjustment.isPaid ? <Check size={12} strokeWidth={2.5} /> : undefined}
        >
          {adjustment.isPaid ? 'Paid' : 'Mark Paid'}
        </Button>
      </Flex>
    </Card>
  );
});

SalaryCard.displayName = 'SalaryCard';
