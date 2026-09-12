'use client';

import React, { useState, useCallback } from 'react';
import { Box, Flex, VStack, Text } from '@chakra-ui/react';
import { StaffSalaryCalculation, SalaryAdjustment } from '../types';
import { formatCurrency, formatMonthDisplay } from '@/utils/dateUtils';
import { SalaryCard } from './SalaryCard';
import { PaySlipModal } from './PaySlipModal';
import confetti from 'canvas-confetti';

interface MonthlySummaryViewProps {
  calculations: StaffSalaryCalculation[];
  currentMonth: string;
  onUpdateAdjustment: (adj: SalaryAdjustment) => void;
}

export const MonthlySummaryView: React.FC<MonthlySummaryViewProps> = ({
  calculations,
  currentMonth,
  onUpdateAdjustment,
}) => {
  const [activeSlipCalc, setActiveSlipCalc] = useState<StaffSalaryCalculation | null>(null);

  const totalBudget = calculations.reduce((acc, c) => acc + c.netPayable, 0);
  const totalPaid = calculations
    .filter((c) => c.adjustment.isPaid)
    .reduce((acc, c) => acc + c.netPayable, 0);
  const totalPending = totalBudget - totalPaid;

  const paidPercent =
    totalBudget > 0 ? Math.min(100, Math.max(0, (totalPaid / totalBudget) * 100)) : 0;

  const handleTogglePaid = useCallback(
    (calc: StaffSalaryCalculation) => {
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
    (calc: StaffSalaryCalculation, val: number) => {
      onUpdateAdjustment({
        ...calc.adjustment,
        bonus: Math.max(0, val),
      });
    },
    [onUpdateAdjustment]
  );

  const handleAdvanceChange = useCallback(
    (calc: StaffSalaryCalculation, val: number) => {
      onUpdateAdjustment({
        ...calc.adjustment,
        advanceDeduction: Math.max(0, val),
      });
    },
    [onUpdateAdjustment]
  );

  return (
    <VStack gap="12px" align="stretch" w="100%" animation="hubFade 320ms ease both">
      {/* Budget Hero */}
      <Box
        p="18px"
        borderRadius="20px"
        bg="var(--hh-ink)"
        color="var(--hh-paper)"
        display="flex"
        flexDirection="column"
        gap="14px"
      >
        <Flex align="flex-end" justify="space-between" gap="12px">
          <Text
            fontFamily="'Instrument Sans', system-ui, sans-serif"
            fontSize="12px"
            fontWeight={600}
            letterSpacing="0.1em"
            textTransform="uppercase"
            opacity={0.7}
            m={0}
          >
            {formatMonthDisplay(currentMonth)} budget
          </Text>
          <Text
            fontFamily="'Instrument Serif', Georgia, serif"
            fontSize="34px"
            lineHeight="1"
            m={0}
          >
            {formatCurrency(totalBudget)}
          </Text>
        </Flex>

        {/* 6px progress rail */}
        <Box display="flex" alignItems="center" gap="10px" w="100%">
          <Box
            w={`${paidPercent}%`}
            h="6px"
            borderRadius="999px"
            bg="var(--hh-accent)"
            transition="width 300ms ease"
          />
          <Box flex={1} h="6px" borderRadius="999px" bg="rgba(255, 255, 255, 0.16)" />
        </Box>

        <Flex
          align="baseline"
          justify="space-between"
          gap="12px"
          fontFamily="'Instrument Sans', system-ui, sans-serif"
          fontSize="13px"
        >
          <Text m={0}>
            Paid{' '}
            <Text as="strong" fontWeight={600}>
              {formatCurrency(totalPaid)}
            </Text>
          </Text>
          <Text opacity={0.72} m={0}>
            Pending{' '}
            <Text as="strong" fontWeight={600}>
              {formatCurrency(totalPending)}
            </Text>
          </Text>
        </Flex>
      </Box>

      {/* Payroll cards */}
      {calculations.map((calc) => (
        <SalaryCard
          key={calc.staff.id}
          calculation={calc}
          onTogglePaid={handleTogglePaid}
          onOpenSlip={setActiveSlipCalc}
          onBonusChange={handleBonusChange}
          onAdvanceChange={handleAdvanceChange}
        />
      ))}

      {/* Pay slip modal */}
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
