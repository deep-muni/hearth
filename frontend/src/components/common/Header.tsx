"use client";

import React from 'react';
import {
  Box,
  Flex,
  HStack,
  Text,
} from '@chakra-ui/react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  ReceiptIndianRupee,
  Users,
  Sparkles,
} from 'lucide-react';
import {
  formatMonthDisplay,
  getNextMonth,
  getPreviousMonth,
  formatCurrency,
} from '@/utils/dateUtils';

interface HeaderProps {
  currentMonth: string;
  onMonthChange: (newMonth: string) => void;
  activeTab: 'calendar' | 'summary' | 'config';
  onTabChange: (tab: 'calendar' | 'summary' | 'config') => void;
  totalMonthlyBudget: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentMonth,
  onMonthChange,
  activeTab,
  onTabChange,
  totalMonthlyBudget,
}) => {
  return (
    <Box
      as="header"
      bg="rgba(255, 255, 255, 0.96)"
      backdropFilter="blur(16px)"
      borderBottom="1px solid #e2e8f0"
      position="sticky"
      top={0}
      zIndex={40}
    >
      <Box maxW="440px" mx="auto" px={3} pt={3} pb={2.5}>
        <Flex align="center" justify="space-between" mb={2.5}>
          <HStack gap={1.5}>
            <Sparkles size={16} color="#f43f5e" />
            <Text fontSize="sm" fontWeight="800" color="#0f172a" letterSpacing="-0.3px">
              HouseHelp
            </Text>
          </HStack>

          <HStack gap={0.5} bg="#f8fafc" px={1} py={0.5} borderRadius="full" border="1px solid #e2e8f0">
            <button
              onClick={() => onMonthChange(getPreviousMonth(currentMonth))}
              style={{
                background: 'transparent',
                border: 'none',
                padding: '3px 6px',
                cursor: 'pointer',
                color: '#64748b',
                display: 'flex',
                alignItems: 'center',
              }}
              aria-label="Previous month"
            >
              <ChevronLeft size={14} />
            </button>

            <Text
              fontSize="11px"
              fontWeight="600"
              color="#0f172a"
              minW="85px"
              textAlign="center"
              userSelect="none"
            >
              {formatMonthDisplay(currentMonth)}
            </Text>

            <button
              onClick={() => onMonthChange(getNextMonth(currentMonth))}
              style={{
                background: 'transparent',
                border: 'none',
                padding: '3px 6px',
                cursor: 'pointer',
                color: '#64748b',
                display: 'flex',
                alignItems: 'center',
              }}
              aria-label="Next month"
            >
              <ChevronRight size={14} />
            </button>
          </HStack>

          <Text fontSize="12px" fontWeight="800" color="#0f172a">
            {formatCurrency(totalMonthlyBudget)}
          </Text>
        </Flex>

        <Flex
          bg="#f1f5f9"
          p={1}
          borderRadius="xl"
          justify="space-between"
          gap={1}
        >
          {[
            { tab: 'calendar' as const, label: 'Calendar', icon: Calendar },
            { tab: 'summary' as const, label: 'Summary', icon: ReceiptIndianRupee },
            { tab: 'config' as const, label: 'Staff', icon: Users },
          ].map(({ tab, label, icon: Icon }) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => onTabChange(tab)}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '6px 10px',
                  borderRadius: '10px',
                  border: 'none',
                  background: isActive ? '#ffffff' : 'transparent',
                  color: isActive ? '#0f172a' : '#64748b',
                  fontSize: '12px',
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                <Icon size={14} strokeWidth={isActive ? 2.3 : 1.8} color={isActive ? '#f43f5e' : '#64748b'} />
                <span>{label}</span>
              </button>
            );
          })}
        </Flex>
      </Box>
    </Box>
  );
};
