"use client";

import React, { useState } from 'react';
import {
  Box,
  Flex,
  HStack,
  VStack,
  Text,
  SimpleGrid,
} from '@chakra-ui/react';
import { HelperSalaryCalculation, MonthlyAdjustment } from '@/types';
import { formatCurrency, formatMonthDisplay } from '@/utils/dateUtils';
import { PaySlipModal } from './PaySlipModal';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  FileText,
  Sparkles,
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
  const [paymentModalHelper, setPaymentModalHelper] = useState<HelperSalaryCalculation | null>(null);
  const [paymentMode, setPaymentMode] = useState<'UPI' | 'Cash' | 'Bank Transfer'>('UPI');

  // Overall household statistics
  const totalBudget = calculations.reduce((acc, c) => acc + c.netPayable, 0);
  const totalPaid = calculations
    .filter((c) => c.adjustment.isPaid)
    .reduce((acc, c) => acc + c.netPayable, 0);
  const totalPending = totalBudget - totalPaid;

  const handleOpenPaymentModal = (calc: HelperSalaryCalculation) => {
    setPaymentModalHelper(calc);
  };

  const handleConfirmPayment = () => {
    if (!paymentModalHelper) return;

    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#ff6b8b', '#8b5cf6', '#10b981', '#f59e0b', '#0ea5e9'],
      });
    } catch {
      // ignore
    }

    const todayStr = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });

    onUpdateAdjustment({
      ...paymentModalHelper.adjustment,
      isPaid: true,
      paidOn: todayStr,
      paymentMethod: paymentMode,
    });

    setPaymentModalHelper(null);
  };

  const handleToggleUnpaid = (calc: HelperSalaryCalculation) => {
    onUpdateAdjustment({
      ...calc.adjustment,
      isPaid: false,
      paidOn: undefined,
      paymentMethod: undefined,
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
    <VStack gap={4} align="stretch" maxW="580px" mx="auto" w="100%">
      {/* 1. Minimal Overview Banner */}
      <Box
        bg="#ffffff"
        borderRadius="2xl"
        p={4}
        border="1px solid #fecdd3"
        boxShadow="0 2px 8px rgba(255, 107, 139, 0.08)"
      >
        <Flex justify="space-between" align="center" mb={3}>
          <Text fontSize="sm" fontWeight="800" color="#1e293b">
            {formatMonthDisplay(currentMonth)} Budget
          </Text>
          <Text fontSize="md" fontWeight="900" color="#e11d48">
            {formatCurrency(totalBudget)}
          </Text>
        </Flex>

        <SimpleGrid columns={2} gap={2}>
          <Box p={2.5} borderRadius="xl" bg="#ecfdf5" border="1px solid #a7f3d0">
            <Text fontSize="10px" fontWeight="700" color="#065f46" textTransform="uppercase">
              Paid Out
            </Text>
            <Text fontSize="sm" fontWeight="800" color="#064e3b" mt={0.5}>
              {formatCurrency(totalPaid)}
            </Text>
          </Box>
          <Box p={2.5} borderRadius="xl" bg="#fffbeb" border="1px solid #fde68a">
            <Text fontSize="10px" fontWeight="700" color="#92400e" textTransform="uppercase">
              Remaining
            </Text>
            <Text fontSize="sm" fontWeight="800" color="#78350f" mt={0.5}>
              {formatCurrency(totalPending)}
            </Text>
          </Box>
        </SimpleGrid>
      </Box>

      {/* 2. Helper Salary Cards */}
      <VStack gap={3} align="stretch">
        {calculations.map((calc) => {
          const { helper, adjustment } = calc;

          return (
            <Box
              key={helper.id}
              bg="#ffffff"
              borderRadius="2xl"
              p={4}
              border="1px solid #f1f5f9"
              boxShadow="0 1px 4px rgba(0,0,0,0.03)"
            >
              {/* Top Row: Info & Net Pay */}
              <Flex justify="space-between" align="center" mb={2}>
                <HStack gap={2.5}>
                  <Box
                    w="38px"
                    h="38px"
                    borderRadius="xl"
                    bg="#fff1f2"
                    border="1px solid #fecdd3"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    fontSize="20px"
                  >
                    {helper.avatarEmoji}
                  </Box>
                  <Box>
                    <Text fontSize="sm" fontWeight="800" color="#1e293b">
                      {helper.name}
                    </Text>
                    <Text fontSize="11px" color="#64748b">
                      {helper.role} • {calc.daysPresent} days worked
                    </Text>
                  </Box>
                </HStack>

                <Box textAlign="right">
                  <Text fontSize="xs" fontWeight="600" color="#64748b">
                    Net Pay
                  </Text>
                  <Text fontSize="md" fontWeight="900" color="#e11d48">
                    {formatCurrency(calc.netPayable)}
                  </Text>
                </Box>
              </Flex>

              {/* Math breakdown row */}
              <Flex
                justify="space-between"
                align="center"
                bg="#f8fafc"
                p={2}
                borderRadius="xl"
                fontSize="11px"
                color="#475569"
                mb={3}
                wrap="wrap"
                gap={1}
              >
                <Text>
                  Base: <strong>{formatCurrency(calc.baseAmount)}</strong>
                </Text>
                {calc.deductions > 0 && (
                  <Text color="#e11d48">
                    Leaves: <strong>-{formatCurrency(calc.deductions)}</strong> ({calc.deductibleLeavesCount}d)
                  </Text>
                )}
                {calc.bonus > 0 && (
                  <Text color="#059669">
                    Bonus: <strong>+{formatCurrency(calc.bonus)}</strong>
                  </Text>
                )}
                {calc.advanceDeduction > 0 && (
                  <Text color="#d97706">
                    Advance: <strong>-{formatCurrency(calc.advanceDeduction)}</strong>
                  </Text>
                )}
              </Flex>

              {/* Bonus / Advance Adjustments (Compact inputs) */}
              <HStack gap={2} mb={3}>
                <Box flex={1}>
                  <Text fontSize="10px" color="#64748b" fontWeight="600" mb={0.5}>
                    + Bonus (₹)
                  </Text>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={calc.bonus || ''}
                    onChange={(e) => handleBonusChange(calc, Number(e.target.value))}
                    placeholder="0"
                    style={{
                      width: '100%',
                      padding: '5px 8px',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      fontSize: '12px',
                      fontWeight: '600',
                      outline: 'none',
                    }}
                  />
                </Box>

                <Box flex={1}>
                  <Text fontSize="10px" color="#64748b" fontWeight="600" mb={0.5}>
                    - Advance (₹)
                  </Text>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={calc.advanceDeduction || ''}
                    onChange={(e) => handleAdvanceChange(calc, Number(e.target.value))}
                    placeholder="0"
                    style={{
                      width: '100%',
                      padding: '5px 8px',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      fontSize: '12px',
                      fontWeight: '600',
                      outline: 'none',
                    }}
                  />
                </Box>
              </HStack>

              {/* Bottom Actions */}
              <Flex justify="space-between" align="center">
                <button
                  onClick={() => setActiveSlipCalc(calc)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '6px 12px',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0',
                    background: '#ffffff',
                    color: '#64748b',
                    fontSize: '11px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  <FileText size={13} />
                  <span>Pay Slip</span>
                </button>

                {adjustment.isPaid ? (
                  <button
                    onClick={() => handleToggleUnpaid(calc)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '6px 14px',
                      borderRadius: '10px',
                      border: '1px solid #a7f3d0',
                      background: '#ecfdf5',
                      color: '#065f46',
                      fontSize: '11px',
                      fontWeight: '700',
                      cursor: 'pointer',
                    }}
                  >
                    <CheckCircle2 size={13} color="#059669" />
                    <span>Paid ({adjustment.paymentMethod || 'UPI'})</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleOpenPaymentModal(calc)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '6px 16px',
                      borderRadius: '10px',
                      border: 'none',
                      background: '#e11d48',
                      color: '#ffffff',
                      fontSize: '11px',
                      fontWeight: '700',
                      cursor: 'pointer',
                    }}
                  >
                    <Sparkles size={12} />
                    <span>Mark Paid</span>
                  </button>
                )}
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

      {/* Mark As Paid Dialog */}
      {paymentModalHelper && (
        <Box
          position="fixed"
          inset={0}
          bg="rgba(15, 23, 42, 0.5)"
          backdropFilter="blur(3px)"
          display="flex"
          alignItems="center"
          justifyContent="center"
          zIndex={100}
          p={4}
        >
          <Box
            bg="#ffffff"
            borderRadius="2xl"
            maxW="360px"
            w="100%"
            p={5}
            boxShadow="0 20px 40px rgba(0,0,0,0.15)"
          >
            <Text fontSize="sm" fontWeight="800" color="#1e293b" mb={1}>
              Record Payment
            </Text>
            <Text fontSize="xs" color="#64748b" mb={4}>
              Pay {formatCurrency(paymentModalHelper.netPayable)} to {paymentModalHelper.helper.name}
            </Text>

            <VStack gap={2} align="stretch" mb={5}>
              {(['UPI', 'Cash', 'Bank Transfer'] as const).map((mode) => {
                const isSelected = paymentMode === mode;
                return (
                  <Box
                    key={mode}
                    onClick={() => setPaymentMode(mode)}
                    p={2.5}
                    borderRadius="xl"
                    border="1.5px solid"
                    borderColor={isSelected ? '#e11d48' : '#e2e8f0'}
                    bg={isSelected ? '#fff1f2' : '#ffffff'}
                    cursor="pointer"
                    fontSize="12px"
                    fontWeight={isSelected ? '700' : '500'}
                    color={isSelected ? '#9f1239' : '#334155'}
                  >
                    {mode === 'UPI' && '📱 UPI / GPay / PhonePe'}
                    {mode === 'Cash' && '💵 Cash'}
                    {mode === 'Bank Transfer' && '🏦 Bank Transfer'}
                  </Box>
                );
              })}
            </VStack>

            <Flex justify="flex-end" gap={2}>
              <button
                onClick={() => setPaymentModalHelper(null)}
                style={{
                  padding: '7px 14px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#475569',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmPayment}
                style={{
                  padding: '7px 18px',
                  borderRadius: '10px',
                  border: 'none',
                  background: '#e11d48',
                  color: '#ffffff',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer',
                }}
              >
                Confirm Paid
              </button>
            </Flex>
          </Box>
        </Box>
      )}
    </VStack>
  );
};
