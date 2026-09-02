"use client";

import React, { useState } from 'react';
import {
  Box,
  Flex,
  HStack,
  VStack,
  Text,
} from '@chakra-ui/react';
import { HelperSalaryCalculation, MonthlyAdjustment } from '@/types';
import { formatCurrency, formatMonthDisplay } from '@/utils/dateUtils';
import { PaySlipModal } from './PaySlipModal';
import confetti from 'canvas-confetti';
import {
  Receipt,
  Check,
} from 'lucide-react';

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

  const handleTogglePaid = (calc: HelperSalaryCalculation) => {
    const isCurrentlyPaid = calc.adjustment.isPaid;

    if (!isCurrentlyPaid) {
      try {
        confetti({
          particleCount: 50,
          spread: 50,
          origin: { y: 0.7 },
        });
      } catch {
        // ignore
      }
    }

    onUpdateAdjustment({
      ...calc.adjustment,
      isPaid: !isCurrentlyPaid,
      paidOn: !isCurrentlyPaid ? new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : undefined,
      paymentMethod: !isCurrentlyPaid ? 'UPI' : undefined,
    });
  };

  const handleBonusChange = (calc: HelperSalaryCalculation, val: number) => {
    onUpdateAdjustment({
      ...calc.adjustment,
      bonus: Math.max(0, val),
    });
  };

  const handleAdvanceChange = (calc: HelperSalaryCalculation, val: number) => {
    onUpdateAdjustment({
      ...calc.adjustment,
      advanceDeduction: Math.max(0, val),
    });
  };

  return (
    <VStack gap={3} align="stretch" maxW="440px" mx="auto" w="100%">
      {/* 1. Minimal Overview Stats */}
      <Box
        bg="#ffffff"
        borderRadius="xl"
        p={3.5}
        border="1px solid #e2e8f0"
        boxShadow="0 1px 3px rgba(0, 0, 0, 0.02)"
      >
        <Flex justify="space-between" align="center" mb={1.5}>
          <Text fontSize="12px" fontWeight="600" color="#64748b">
            {formatMonthDisplay(currentMonth)} Budget
          </Text>
          <Text fontSize="md" fontWeight="800" color="#0f172a">
            {formatCurrency(totalBudget)}
          </Text>
        </Flex>

        <Flex justify="space-between" fontSize="11px" color="#64748b">
          <Text>
            Paid: <strong style={{ color: '#10b981' }}>{formatCurrency(totalPaid)}</strong>
          </Text>
          <Text>
            Pending: <strong style={{ color: '#f59e0b' }}>{formatCurrency(totalPending)}</strong>
          </Text>
        </Flex>
      </Box>

      {/* 2. Staff Compensation Cards */}
      <VStack gap={2} align="stretch">
        {calculations.map((calc) => {
          const { helper, adjustment } = calc;

          return (
            <Box
              key={helper.id}
              bg="#ffffff"
              borderRadius="xl"
              p={3}
              border="1px solid"
              borderColor={adjustment.isPaid ? '#e2e8f0' : '#e2e8f0'}
              boxShadow="0 1px 2px rgba(0,0,0,0.02)"
            >
              {/* Top Row */}
              <Flex justify="space-between" align="center" mb={1.5}>
                <HStack gap={2}>
                  <Text fontSize="16px">{helper.avatarEmoji}</Text>
                  <Box>
                    <Text fontSize="13px" fontWeight="700" color="#0f172a">
                      {helper.name}
                    </Text>
                    <Text fontSize="10px" color="#94a3b8">
                      {helper.role} • {calc.daysPresent}d worked
                    </Text>
                  </Box>
                </HStack>

                <Box textAlign="right">
                  <Text fontSize="14px" fontWeight="800" color="#0f172a">
                    {formatCurrency(calc.netPayable)}
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
                <Text>Base {formatCurrency(calc.baseAmount)}</Text>
                {calc.deductions > 0 && (
                  <Text color="#ef4444">-{formatCurrency(calc.deductions)} leaves</Text>
                )}
                {calc.bonus > 0 && (
                  <Text color="#10b981">+{formatCurrency(calc.bonus)} bonus</Text>
                )}
                {calc.advanceDeduction > 0 && (
                  <Text color="#f59e0b">-{formatCurrency(calc.advanceDeduction)} advance</Text>
                )}
              </Flex>

              {/* Quick Bonus & Advance Inputs */}
              <HStack gap={1.5} mb={2}>
                <Box flex={1}>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={calc.bonus || ''}
                    onChange={(e) => handleBonusChange(calc, Number(e.target.value))}
                    placeholder="+ Bonus"
                    style={{
                      width: '100%',
                      padding: '4px 7px',
                      borderRadius: '6px',
                      border: '1px solid #e2e8f0',
                      fontSize: '11px',
                      outline: 'none',
                    }}
                  />
                </Box>
                <Box flex={1}>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={calc.advanceDeduction || ''}
                    onChange={(e) => handleAdvanceChange(calc, Number(e.target.value))}
                    placeholder="- Advance"
                    style={{
                      width: '100%',
                      padding: '4px 7px',
                      borderRadius: '6px',
                      border: '1px solid #e2e8f0',
                      fontSize: '11px',
                      outline: 'none',
                    }}
                  />
                </Box>
              </HStack>

              {/* Actions Row */}
              <Flex justify="space-between" align="center" pt={1}>
                <button
                  onClick={() => setActiveSlipCalc(calc)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    background: 'transparent',
                    border: 'none',
                    color: '#64748b',
                    fontSize: '11px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    padding: '3px 6px',
                  }}
                >
                  <Receipt size={12} />
                  <span>Pay Slip</span>
                </button>

                <button
                  onClick={() => handleTogglePaid(calc)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '5px 12px',
                    borderRadius: '6px',
                    border: '1px solid',
                    borderColor: adjustment.isPaid ? '#10b981' : '#0f172a',
                    background: adjustment.isPaid ? '#ecfdf5' : '#0f172a',
                    color: adjustment.isPaid ? '#065f46' : '#ffffff',
                    fontSize: '11px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.12s ease',
                  }}
                >
                  {adjustment.isPaid ? (
                    <>
                      <Check size={12} strokeWidth={2.5} />
                      <span>Paid</span>
                    </>
                  ) : (
                    <span>Mark Paid</span>
                  )}
                </button>
              </Flex>
            </Box>
          );
        })}
      </VStack>

      {/* Pay Slip Modal */}
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
