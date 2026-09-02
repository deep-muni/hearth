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
  Receipt,
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
    <>
      {/* Sleek Top Navigation Bar */}
      <Box
        as="header"
        bg="rgba(255, 255, 255, 0.9)"
        backdropFilter="blur(16px)"
        borderBottom="1px solid #f1f5f9"
        py={3}
        px={{ base: 4, md: 8 }}
        position="sticky"
        top={0}
        zIndex={40}
      >
        <Flex
          align="center"
          justify="space-between"
          maxW="540px"
          mx="auto"
        >
          {/* Logo */}
          <HStack gap={1.5}>
            <Sparkles size={16} color="#f43f5e" />
            <Text fontSize="sm" fontWeight="700" color="#0f172a" letterSpacing="-0.3px">
              HouseHelp
            </Text>
          </HStack>

          {/* Minimal Month Switcher */}
          <HStack gap={1} bg="#f8fafc" px={1.5} py={1} borderRadius="full" border="1px solid #e2e8f0">
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
              <ChevronLeft size={15} />
            </button>

            <Text
              fontSize="12px"
              fontWeight="600"
              color="#0f172a"
              minW="95px"
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
              <ChevronRight size={15} />
            </button>
          </HStack>

          {/* Budget Text */}
          <Text fontSize="12px" fontWeight="700" color="#0f172a">
            {formatCurrency(totalMonthlyBudget)}
          </Text>
        </Flex>
      </Box>

      {/* Floating Minimal Bottom Navigation (Mobile & Desktop) */}
      <Box
        position="fixed"
        bottom={{ base: 0, md: 4 }}
        left={0}
        right={0}
        zIndex={50}
        pointerEvents="none"
      >
        <Box
          maxW="340px"
          mx="auto"
          bg="rgba(255, 255, 255, 0.95)"
          backdropFilter="blur(20px)"
          borderRadius={{ base: '0', md: 'full' }}
          borderTop={{ base: '1px solid #f1f5f9', md: 'none' }}
          border={{ base: 'none', md: '1px solid #e2e8f0' }}
          boxShadow="0 4px 20px rgba(0, 0, 0, 0.06)"
          px={3}
          py={2}
          pb={{ base: 'calc(env(safe-area-inset-bottom, 8px) + 8px)', md: 2 }}
          pointerEvents="auto"
        >
          <Flex justify="space-around" align="center">
            {[
              { tab: 'calendar' as const, label: 'Calendar', icon: Calendar },
              { tab: 'summary' as const, label: 'Summary', icon: Receipt },
              { tab: 'config' as const, label: 'Staff', icon: Users },
            ].map(({ tab, label, icon: Icon }) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => onTabChange(tab)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '3px',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    color: isActive ? '#f43f5e' : '#94a3b8',
                    padding: '4px 18px',
                    transition: 'color 0.15s ease',
                  }}
                >
                  <Icon size={18} strokeWidth={isActive ? 2.3 : 1.8} />
                  <Text fontSize="10px" fontWeight={isActive ? '700' : '500'}>
                    {label}
                  </Text>
                </button>
              );
            })}
          </Flex>
        </Box>
      </Box>
    </>
  );
};
