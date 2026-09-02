'use client';

import React, { useState, useCallback } from 'react';
import { Flex, VStack, Text } from '@chakra-ui/react';
import { HelperSalaryCalculation, MonthlyAdjustment } from '@/types';
import { formatCurrency, formatMonthDisplay } from '@/utils/dateUtils';
import { SalaryCard } from './SalaryCard';
import { PaySlipModal } from './PaySlipModal';
import { Card } from '@/components/ui/Card';
import confetti from 'canvas-confetti';

interface MonthlySummaryViewProps {
  calculations: HelperSalaryCalculation[];
  currentMonth: string;
  onUpdateAdjustment: (adj: MonthlyAdjustment) => void;
}

export const MonthlySummaryView: React.FC<MonthlySummaryViewProps> = ({
  calculations,
  currentMonth,
  onUpdateAdjustment,
}) => {
  const [activeSlipCalc, setActiveSlipCalc] = useState<HelperSalaryCalculation | null>(null);

  const totalBudget = calculations.reduce((acc, c) => acc + c.netPayable, 0);
  const totalPaid = calculations
    .filter((c) => c.adjustment.isPaid)
    .reduce((acc, c) => acc + c.netPayable, 0);
  const totalPending = totalBudget - totalPaid;

  const handleTogglePaid = useCallback(
    (calc: HelperSalaryCalculation) => {
      const isCurrentlyPaid = calc.adjustment.isPaid;

      if (!isCurrentlyPaid) {
        try {
          confetti({
            particleCount: 50,
            spread: 50,
            origin: { y: 0.7 },
          });
        } catch {}
      }

      onUpdateAdjustment({
        ...calc.adjustment,
        isPaid: !isCurrentlyPaid,
        paidOn: !isCurrentlyPaid
          ? new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          : undefined,
        paymentMethod: !isCurrentlyPaid ? 'UPI' : undefined,
      });
    },
    [onUpdateAdjustment]
  );

  const handleBonusChange = useCallback(
    (calc: HelperSalaryCalculation, val: number) => {
      onUpdateAdjustment({
        ...calc.adjustment,
        bonus: Math.max(0, val),
      });
    },
    [onUpdateAdjustment]
  );

  const handleAdvanceChange = useCallback(
    (calc: HelperSalaryCalculation, val: number) => {
      onUpdateAdjustment({
        ...calc.adjustment,
        advanceDeduction: Math.max(0, val),
      });
    },
    [onUpdateAdjustment]
  );

  return (
    <VStack gap={3} align="stretch" w="100%">
      <Card style={{ padding: '14px' }}>
        <Flex justify="space-between" align="center" mb={1.5}>
          <Text fontSize="12px" fontWeight="600" color="var(--text-muted)">
            {formatMonthDisplay(currentMonth)} Budget
          </Text>
          <Text fontSize="md" fontWeight="800" color="var(--text-primary)">
            {formatCurrency(totalBudget)}
          </Text>
        </Flex>

        <Flex justify="space-between" fontSize="11px" color="var(--text-muted)">
          <Text>
            Paid:{' '}
            <strong style={{ color: 'var(--color-success)' }}>{formatCurrency(totalPaid)}</strong>
          </Text>
          <Text>
            Pending:{' '}
            <strong style={{ color: 'var(--color-warning)' }}>
              {formatCurrency(totalPending)}
            </strong>
          </Text>
        </Flex>
      </Card>

      <VStack gap={2} align="stretch">
        {calculations.map((calc) => (
          <SalaryCard
            key={calc.helper.id}
            calculation={calc}
            onTogglePaid={handleTogglePaid}
            onOpenSlip={setActiveSlipCalc}
            onBonusChange={handleBonusChange}
            onAdvanceChange={handleAdvanceChange}
          />
        ))}
      </VStack>

      {activeSlipCalc && (
        <PaySlipModal
          isOpen={!!activeSlipCalc}
          onClose={() => setActiveSlipCalc(null)}
          calculation={activeSlipCalc}
        />
      )}
    </VStack>
  );
};
