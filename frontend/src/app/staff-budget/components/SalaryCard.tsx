'use client';

import React, { memo, useState, useEffect } from 'react';
import { Box, Flex, Text, Button, Input, SimpleGrid } from '@chakra-ui/react';
import { StaffSalaryCalculation } from '../types';
import { formatCurrency } from '@/utils/dateUtils';
import { RoleIcon, SlipIcon } from '@/components/icons';
import { normalizeSalaryType } from '../utils/salaryCalculator';

interface SalaryCardProps {
  calculation: StaffSalaryCalculation;
  onTogglePaid: (calc: StaffSalaryCalculation) => void;
  onOpenSlip: (calc: StaffSalaryCalculation) => void;
  onBonusChange: (calc: StaffSalaryCalculation, val: number) => void;
  onAdvanceChange: (calc: StaffSalaryCalculation, val: number) => void;
}

export const SalaryCard: React.FC<SalaryCardProps> = memo(
  ({ calculation, onTogglePaid, onOpenSlip, onBonusChange, onAdvanceChange }) => {
    const staffMember = calculation.staff;
    const { adjustment } = calculation;
    const normalizedType = normalizeSalaryType(staffMember.salaryType);
    const isPaid = !!adjustment.isPaid;

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

    const meta =
      normalizedType === 'COUNT_BASED'
        ? `${staffMember.role} · ${calculation.totalItemCount} ${calculation.itemUnitName}`
        : normalizedType === 'FIXED'
          ? `${staffMember.role} · fixed payout`
          : `${staffMember.role} · ${calculation.daysPresent}d worked · ${calculation.totalLeavesCount} leaves`;

    const calcDetails: string[] = [];
    if (normalizedType === 'COUNT_BASED') {
      calcDetails.push(
        `${calculation.totalItemCount} ${calculation.itemUnitName} × ${formatCurrency(calculation.ratePerItem)} = ${formatCurrency(calculation.baseAmount)}`
      );
    } else if (normalizedType === 'FIXED') {
      calcDetails.push(`Flat monthly ${formatCurrency(calculation.baseAmount)}`);
    } else {
      calcDetails.push(`Base ${formatCurrency(calculation.baseAmount)}`);
      if (calculation.deductions > 0) {
        calcDetails.push(`-${formatCurrency(calculation.deductions)} leaves`);
      }
    }

    if (calculation.bonus > 0) {
      calcDetails.push(`+${formatCurrency(calculation.bonus)} bonus`);
    }
    if (calculation.advanceDeduction > 0) {
      calcDetails.push(`-${formatCurrency(calculation.advanceDeduction)} advance`);
    }

    const calcString = calcDetails.join(' · ');

    return (
      <Box
        p="16px 16px 14px"
        borderRadius="20px"
        bg="var(--hh-card)"
        border="1px solid var(--hh-line)"
        boxShadow="0 1px 2px rgba(28, 26, 23, 0.03)"
        display="flex"
        flexDirection="column"
        gap="12px"
      >
        {/* Row 1: Header */}
        <Flex align="flex-start" justify="space-between" gap="12px">
          <Flex align="center" gap="11px" minW="0">
            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              flex="none"
              w="38px"
              h="38px"
              borderRadius="50%"
              bg="var(--hh-accentSoft)"
              color="var(--hh-accentInk)"
            >
              <RoleIcon name={staffMember.icon || staffMember.role} size={19} strokeWidth={1.6} />
            </Box>
            <Box minW="0">
              <Text
                fontFamily="'Instrument Sans', system-ui, sans-serif"
                fontSize="15.5px"
                fontWeight={600}
                letterSpacing="-0.01em"
                color="var(--hh-ink)"
                m={0}
              >
                {staffMember.name}
              </Text>
              <Text
                fontFamily="'Instrument Sans', system-ui, sans-serif"
                fontSize="12.5px"
                color="var(--hh-muted)"
                m={0}
              >
                {meta}
              </Text>
            </Box>
          </Flex>

          <Flex direction="column" align="flex-end" gap="4px" flex="none">
            <Text
              fontFamily="'Instrument Serif', Georgia, serif"
              fontSize="22px"
              lineHeight="1"
              color="var(--hh-ink)"
              m={0}
            >
              {formatCurrency(calculation.netPayable)}
            </Text>
            <Text
              fontFamily="'Instrument Sans', system-ui, sans-serif"
              fontSize="11px"
              fontWeight={600}
              letterSpacing="0.06em"
              textTransform="uppercase"
              color={isPaid ? '#3F7A57' : 'var(--hh-accentInk)'}
              m={0}
            >
              {isPaid ? 'Paid' : 'Pending'}
            </Text>
          </Flex>
        </Flex>

        {/* Row 2: Calculation strip */}
        <Box
          p="10px 12px"
          borderRadius="12px"
          bg="var(--hh-sunken)"
          fontFamily="'Instrument Sans', system-ui, sans-serif"
          fontSize="12.5px"
          color="var(--hh-muted)"
        >
          {calcString}
        </Box>

        {/* Row 3: Bonus / Advance inputs */}
        <SimpleGrid columns={2} gap="8px">
          <Input
            type="number"
            min="0"
            step="any"
            value={bonusVal}
            onChange={handleBonusInputChange}
            placeholder="+ Bonus (₹)"
            w="100%"
            p="10px 12px"
            h="auto"
            borderRadius="12px"
            border="1px solid var(--hh-line)"
            bg="var(--hh-cardHover)"
            fontFamily="'Instrument Sans', system-ui, sans-serif"
            fontSize="13px"
            color="var(--hh-ink)"
            _focus={{
              outline: '2px solid var(--hh-accent)',
              outlineOffset: '1px',
            }}
          />
          <Input
            type="number"
            min="0"
            step="any"
            value={advanceVal}
            onChange={handleAdvanceInputChange}
            placeholder="− Advance (₹)"
            w="100%"
            p="10px 12px"
            h="auto"
            borderRadius="12px"
            border="1px solid var(--hh-line)"
            bg="var(--hh-cardHover)"
            fontFamily="'Instrument Sans', system-ui, sans-serif"
            fontSize="13px"
            color="var(--hh-ink)"
            _focus={{
              outline: '2px solid var(--hh-accent)',
              outlineOffset: '1px',
            }}
          />
        </SimpleGrid>

        {/* Row 4: Actions */}
        <Flex align="center" justify="space-between" gap="10px">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenSlip(calculation)}
            display="inline-flex"
            alignItems="center"
            gap="7px"
            p="9px 4px"
            h="auto"
            fontFamily="'Instrument Sans', system-ui, sans-serif"
            fontSize="13px"
            fontWeight={600}
            color="var(--hh-accentInk)"
            _hover={{
              textDecoration: 'underline',
              bg: 'transparent',
            }}
          >
            <SlipIcon size={15} strokeWidth={1.8} />
            Pay slip
          </Button>

          <Button
            type="button"
            onClick={() => onTogglePaid(calculation)}
            px="16px"
            py="10px"
            h="auto"
            borderRadius="999px"
            border={isPaid ? '1px solid var(--hh-line)' : 'none'}
            bg={isPaid ? 'transparent' : 'var(--hh-ink)'}
            color={isPaid ? 'var(--hh-muted)' : 'var(--hh-paper)'}
            fontFamily="'Instrument Sans', system-ui, sans-serif"
            fontSize="13px"
            fontWeight={600}
            transition="transform 170ms ease, opacity 200ms ease"
            _hover={{
              transform: isPaid ? 'none' : 'translateY(-1px)',
              opacity: isPaid ? 0.8 : 0.92,
            }}
          >
            {isPaid ? 'Paid' : 'Mark paid'}
          </Button>
        </Flex>
      </Box>
    );
  }
);

SalaryCard.displayName = 'SalaryCard';
