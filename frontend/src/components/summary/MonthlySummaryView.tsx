"use client";

import React, { useState } from 'react';
import {
  Box,
  Flex,
  HStack,
  VStack,
  Text,
  Badge,
  SimpleGrid,
} from '@chakra-ui/react';
import { HelperSalaryCalculation, MonthlyAdjustment } from '@/types';
import { formatCurrency, formatMonthDisplay } from '@/utils/dateUtils';
import { PaySlipModal } from './PaySlipModal';
import confetti from 'canvas-confetti';
import {
  Wallet,
  CheckCircle2,
  AlertCircle,
  FileText,
  Gift,
  HandCoins,
  Sparkles,
  ArrowDownCircle,
  DollarSign,
  TrendingDown,
  Clock,
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
  const totalLeavesTaken = calculations.reduce((acc, c) => acc + c.totalLeavesCount, 0);

  const handleOpenPaymentModal = (calc: HelperSalaryCalculation) => {
    setPaymentModalHelper(calc);
  };

  const handleConfirmPayment = () => {
    if (!paymentModalHelper) return;

    // Fire cute celebration confetti
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ff6b8b', '#8b5cf6', '#10b981', '#f59e0b', '#0ea5e9'],
      });
    } catch (e) {
      console.log('Confetti not available', e);
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
    <VStack gap={6} align="stretch" maxW="1400px" mx="auto" w="100%">
      {/* 1. Monthly Overview Banner */}
      <Box
        bg="#ffffff"
        borderRadius="3xl"
        p={{ base: 5, md: 7 }}
        border="2px solid #ffd4dc"
        boxShadow="0 10px 30px -10px rgba(255, 107, 139, 0.15)"
      >
        <Flex
          direction={{ base: 'column', md: 'row' }}
          align={{ base: 'flex-start', md: 'center' }}
          justify="space-between"
          gap={4}
          mb={6}
        >
          <Box>
            <HStack gap={2}>
              <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight="800" color="#831843">
                Household Salary Budget
              </Text>
              <Badge
                bg="#fdf2f8"
                color="#be185d"
                border="1px solid #fbcfe8"
                borderRadius="full"
                px={3}
                py={0.5}
                fontWeight="700"
              >
                {formatMonthDisplay(currentMonth)}
              </Badge>
            </HStack>
            <Text fontSize="xs" color="#64748b" mt={1}>
              Automated compensation calculation based on leaves, allowances, bonuses, and advance loans.
            </Text>
          </Box>
        </Flex>

        {/* 4 Cute Stat Cards */}
        <SimpleGrid columns={{ base: 2, lg: 4 }} gap={4}>
          <Box
            p={4}
            borderRadius="2xl"
            bg="linear-gradient(135deg, #fff0f4 0%, #ffe4e9 100%)"
            border="1.5px solid #fecdd3"
          >
            <Flex align="center" justify="space-between">
              <Text fontSize="xs" fontWeight="700" color="#9f1239" textTransform="uppercase">
                Total Budget
              </Text>
              <Wallet size={18} color="#e11d48" />
            </Flex>
            <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight="900" color="#881337" mt={2}>
              {formatCurrency(totalBudget)}
            </Text>
            <Text fontSize="11px" color="#9f1239" mt={1}>
              Total payout for {calculations.length} helpers
            </Text>
          </Box>

          <Box
            p={4}
            borderRadius="2xl"
            bg="linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)"
            border="1.5px solid #a7f3d0"
          >
            <Flex align="center" justify="space-between">
              <Text fontSize="xs" fontWeight="700" color="#065f46" textTransform="uppercase">
                Paid Out
              </Text>
              <CheckCircle2 size={18} color="#059669" />
            </Flex>
            <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight="900" color="#064e3b" mt={2}>
              {formatCurrency(totalPaid)}
            </Text>
            <Text fontSize="11px" color="#047857" mt={1}>
              Disbursed to staff
            </Text>
          </Box>

          <Box
            p={4}
            borderRadius="2xl"
            bg="linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)"
            border="1.5px solid #fde68a"
          >
            <Flex align="center" justify="space-between">
              <Text fontSize="xs" fontWeight="700" color="#92400e" textTransform="uppercase">
                Pending Payout
              </Text>
              <Clock size={18} color="#d97706" />
            </Flex>
            <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight="900" color="#78350f" mt={2}>
              {formatCurrency(totalPending)}
            </Text>
            <Text fontSize="11px" color="#b45309" mt={1}>
              Remaining to disburse
            </Text>
          </Box>

          <Box
            p={4}
            borderRadius="2xl"
            bg="linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)"
            border="1.5px solid #ddd6fe"
          >
            <Flex align="center" justify="space-between">
              <Text fontSize="xs" fontWeight="700" color="#5b21b6" textTransform="uppercase">
                Leaves Taken
              </Text>
              <Sparkles size={18} color="#7c3aed" />
            </Flex>
            <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight="900" color="#4c1d95" mt={2}>
              {totalLeavesTaken} {totalLeavesTaken === 1 ? 'day' : 'days'}
            </Text>
            <Text fontSize="11px" color="#6d28d9" mt={1}>
              Across all staff members
            </Text>
          </Box>
        </SimpleGrid>
      </Box>

      {/* 2. List of Staff Salary Cards */}
      <VStack gap={4} align="stretch">
        <Text fontSize="xs" fontWeight="800" color="#9d174d" textTransform="uppercase" letterSpacing="0.8px">
          Staff Compensation Breakdown ({calculations.length})
        </Text>

        {calculations.map((calc) => {
          const { helper, adjustment } = calc;

          return (
            <Box
              key={helper.id}
              bg="#ffffff"
              borderRadius="3xl"
              p={{ base: 4, md: 6 }}
              border="2px solid #ffd4dc"
              boxShadow="0 6px 20px -6px rgba(0, 0, 0, 0.05)"
              transition="all 0.2s"
              _hover={{ borderColor: '#f43f5e' }}
            >
              <Flex
                direction={{ base: 'column', lg: 'row' }}
                justify="space-between"
                align={{ base: 'flex-start', lg: 'center' }}
                gap={5}
              >
                {/* Helper Details & Attendance Summary */}
                <HStack gap={4} align="flex-start">
                  <Box
                    w="56px"
                    h="56px"
                    borderRadius="2xl"
                    bg="#fff1f2"
                    border="2px solid #fecdd3"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    fontSize="28px"
                    boxShadow="sm"
                  >
                    {helper.avatarEmoji}
                  </Box>

                  <Box>
                    <HStack gap={2}>
                      <Text fontSize="lg" fontWeight="800" color="#1e293b">
                        {helper.name}
                      </Text>
                      <Badge
                        bg="#f1f5f9"
                        color="#475569"
                        borderRadius="full"
                        px={2.5}
                        py={0.5}
                        fontSize="xs"
                        fontWeight="700"
                      >
                        {helper.role}
                      </Badge>
                    </HStack>

                    <HStack mt={1.5} gap={2} wrap="wrap">
                      <Badge
                        bg="#fdf2f8"
                        color="#be185d"
                        borderRadius="lg"
                        px={2}
                        py={0.5}
                        fontSize="11px"
                      >
                        {helper.salaryType === 'FIXED_MONTHLY' && `Fixed: ${formatCurrency(helper.baseSalary)}/mo`}
                        {helper.salaryType === 'DAILY_WAGE' && `Daily: ${formatCurrency(helper.baseSalary)}/day`}
                        {helper.salaryType === 'STRICT_FLAT' && `Flat: ${formatCurrency(helper.baseSalary)}`}
                      </Badge>

                      <Badge
                        bg="#f0fdf4"
                        color="#166534"
                        borderRadius="lg"
                        px={2}
                        py={0.5}
                        fontSize="11px"
                      >
                        {calc.daysPresent} days worked
                      </Badge>

                      <Badge
                        bg={calc.deductibleLeavesCount > 0 ? '#fee2e2' : '#f8fafc'}
                        color={calc.deductibleLeavesCount > 0 ? '#991b1b' : '#64748b'}
                        borderRadius="lg"
                        px={2}
                        py={0.5}
                        fontSize="11px"
                      >
                        {calc.totalLeavesCount} leaves ({calc.deductibleLeavesCount} deductible)
                      </Badge>
                    </HStack>
                  </Box>
                </HStack>

                {/* Financial Adjustments (Bonus & Advance inputs) */}
                <HStack gap={3} wrap="wrap">
                  <Box
                    p={2.5}
                    borderRadius="xl"
                    bg="#f0fdf4"
                    border="1px solid #bbf7d0"
                    minW="120px"
                  >
                    <HStack gap={1} color="#166534" mb={1}>
                      <Gift size={13} />
                      <Text fontSize="10px" fontWeight="700">
                        Bonus / Tip (₹)
                      </Text>
                    </HStack>
                    <input
                      type="number"
                      min="0"
                      step="50"
                      value={calc.bonus || ''}
                      onChange={(e) => handleBonusChange(calc, Number(e.target.value))}
                      placeholder="0"
                      style={{
                        width: '100%',
                        padding: '4px 8px',
                        borderRadius: '8px',
                        border: '1px solid #86efac',
                        background: '#ffffff',
                        fontSize: '12px',
                        fontWeight: '700',
                        color: '#15803d',
                        outline: 'none',
                      }}
                    />
                  </Box>

                  <Box
                    p={2.5}
                    borderRadius="xl"
                    bg="#fffbeb"
                    border="1px solid #fde68a"
                    minW="120px"
                  >
                    <HStack gap={1} color="#92400e" mb={1}>
                      <HandCoins size={13} />
                      <Text fontSize="10px" fontWeight="700">
                        Advance Paid (₹)
                      </Text>
                    </HStack>
                    <input
                      type="number"
                      min="0"
                      step="100"
                      value={calc.advanceDeduction || ''}
                      onChange={(e) => handleAdvanceChange(calc, Number(e.target.value))}
                      placeholder="0"
                      style={{
                        width: '100%',
                        padding: '4px 8px',
                        borderRadius: '8px',
                        border: '1px solid #fcd34d',
                        background: '#ffffff',
                        fontSize: '12px',
                        fontWeight: '700',
                        color: '#b45309',
                        outline: 'none',
                      }}
                    />
                  </Box>

                  {/* Net Payable Badge */}
                  <Box
                    p={3}
                    borderRadius="2xl"
                    bg="linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)"
                    border="2px solid #fda4af"
                    textAlign="center"
                    minW="140px"
                  >
                    <Text fontSize="10px" fontWeight="800" color="#9f1239" textTransform="uppercase">
                      Net Payable
                    </Text>
                    <Text fontSize="lg" fontWeight="900" color="#881337">
                      {formatCurrency(calc.netPayable)}
                    </Text>
                  </Box>
                </HStack>

                {/* Actions: Mark as Paid & Pay Slip */}
                <HStack gap={2}>
                  {adjustment.isPaid ? (
                    <button
                      onClick={() => handleToggleUnpaid(calc)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '9px 16px',
                        borderRadius: '14px',
                        border: '1.5px solid #a7f3d0',
                        background: '#ecfdf5',
                        color: '#065f46',
                        fontSize: '12px',
                        fontWeight: '700',
                        cursor: 'pointer',
                      }}
                    >
                      <CheckCircle2 size={15} color="#059669" />
                      <span>Paid ({adjustment.paymentMethod || 'UPI'})</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleOpenPaymentModal(calc)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '9px 18px',
                        borderRadius: '14px',
                        border: 'none',
                        background: 'linear-gradient(135deg, #ec4899 0%, #d946ef 100%)',
                        color: '#ffffff',
                        fontSize: '12px',
                        fontWeight: '800',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(236, 72, 153, 0.3)',
                      }}
                    >
                      <Sparkles size={14} />
                      <span>Mark as Paid</span>
                    </button>
                  )}

                  <button
                    onClick={() => setActiveSlipCalc(calc)}
                    title="View & Print Salary Slip"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '9px 14px',
                      borderRadius: '14px',
                      border: '1.5px solid #e2e8f0',
                      background: '#ffffff',
                      color: '#475569',
                      fontSize: '12px',
                      fontWeight: '700',
                      cursor: 'pointer',
                    }}
                  >
                    <FileText size={15} />
                    <span>Slip</span>
                  </button>
                </HStack>
              </Flex>

              {/* Formula & Explanation accordion/note */}
              <Box
                mt={3}
                pt={2.5}
                borderTop="1px dashed #fecdd3"
                fontSize="11px"
                color="#64748b"
              >
                <Text>
                  Formula: Base ({formatCurrency(calc.baseAmount)}){' '}
                  {calc.deductions > 0 && `- Leaves Deduction (${formatCurrency(calc.deductions)}) `}
                  {calc.bonus > 0 && `+ Bonus (${formatCurrency(calc.bonus)}) `}
                  {calc.advanceDeduction > 0 && `- Advance (${formatCurrency(calc.advanceDeduction)}) `}
                  = <strong style={{ color: '#be123c' }}>{formatCurrency(calc.netPayable)}</strong>
                </Text>
              </Box>
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
          bg="rgba(15, 23, 42, 0.6)"
          backdropFilter="blur(4px)"
          display="flex"
          alignItems="center"
          justifyContent="center"
          zIndex={100}
          p={4}
        >
          <Box
            bg="#ffffff"
            borderRadius="3xl"
            border="2px solid #ffd4dc"
            maxW="420px"
            w="100%"
            p={6}
            boxShadow="0 25px 50px -12px rgba(255, 107, 139, 0.3)"
          >
            <HStack gap={3} mb={3}>
              <Box
                w="44px"
                h="44px"
                borderRadius="xl"
                bg="#fff1f2"
                border="2px solid #fecdd3"
                display="flex"
                alignItems="center"
                justifyContent="center"
                fontSize="24px"
              >
                {paymentModalHelper.helper.avatarEmoji}
              </Box>
              <Box>
                <Text fontSize="lg" fontWeight="800" color="#831843">
                  Record Salary Payment
                </Text>
                <Text fontSize="xs" color="#9d174d" fontWeight="600">
                  {paymentModalHelper.helper.name} • {formatCurrency(paymentModalHelper.netPayable)}
                </Text>
              </Box>
            </HStack>

            <Text fontSize="xs" color="#64748b" mb={4}>
              Select the mode of payment used for this transaction:
            </Text>

            <VStack gap={2} align="stretch" mb={6}>
              {(['UPI', 'Cash', 'Bank Transfer'] as const).map((mode) => {
                const isSelected = paymentMode === mode;
                return (
                  <Box
                    key={mode}
                    onClick={() => setPaymentMode(mode)}
                    p={3}
                    borderRadius="xl"
                    border="2px solid"
                    borderColor={isSelected ? '#ec4899' : '#e2e8f0'}
                    bg={isSelected ? '#fdf2f8' : '#ffffff'}
                    cursor="pointer"
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Text
                      fontSize="sm"
                      fontWeight={isSelected ? '800' : '600'}
                      color={isSelected ? '#be185d' : '#334155'}
                    >
                      {mode === 'UPI' && '📱 UPI / PhonePe / GPay'}
                      {mode === 'Cash' && '💵 Cash In Hand'}
                      {mode === 'Bank Transfer' && '🏦 Direct Bank NEFT / IMPS'}
                    </Text>
                    {isSelected && <CheckCircle2 size={16} color="#ec4899" />}
                  </Box>
                );
              })}
            </VStack>

            <Flex justify="flex-end" gap={2}>
              <button
                onClick={() => setPaymentModalHelper(null)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '12px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#475569',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmPayment}
                style={{
                  padding: '8px 22px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #ec4899 0%, #d946ef 100%)',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(236, 72, 153, 0.35)',
                }}
              >
                Confirm Paid ✨
              </button>
            </Flex>
          </Box>
        </Box>
      )}
    </VStack>
  );
};
