'use client';

import React from 'react';
import { Box, Flex, HStack, Text } from '@chakra-ui/react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  ReceiptIndianRupee,
  Users,
  Sparkles,
  Sun,
  Moon,
} from 'lucide-react';
import {
  formatMonthDisplay,
  getNextMonth,
  getPreviousMonth,
  formatCurrency,
} from '@/utils/dateUtils';
import { useColorMode } from '@/components/ui/color-mode';

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
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <Box
      as="header"
      bg="var(--bg-header)"
      backdropFilter="blur(16px)"
      borderBottom="1px solid var(--border-color)"
      position="sticky"
      top={0}
      zIndex={40}
      transition="background-color 0.15s ease, border-color 0.15s ease"
    >
      <Box maxW="440px" mx="auto" px={3} pt={3} pb={2.5}>
        <Flex align="center" justify="space-between" mb={2.5}>
          <HStack gap={1.5}>
            <Sparkles size={16} color="var(--color-accent)" />
            <Text fontSize="sm" fontWeight="800" color="var(--text-primary)" letterSpacing="-0.3px">
              HouseHelp
            </Text>
          </HStack>

          <HStack
            gap={0.5}
            bg="var(--bg-card-subtle)"
            px={1}
            py={0.5}
            borderRadius="full"
            border="1px solid var(--border-color)"
          >
            <button
              onClick={() => onMonthChange(getPreviousMonth(currentMonth))}
              style={{
                background: 'transparent',
                border: 'none',
                padding: '3px 6px',
                cursor: 'pointer',
                color: 'var(--text-muted)',
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
              color="var(--text-primary)"
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
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
              }}
              aria-label="Next month"
            >
              <ChevronRight size={14} />
            </button>
          </HStack>

          <HStack gap={1.5} align="center">
            <Text fontSize="12px" fontWeight="800" color="var(--text-primary)">
              {formatCurrency(totalMonthlyBudget)}
            </Text>

            <button
              onClick={toggleColorMode}
              style={{
                background: 'var(--bg-card-subtle)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: colorMode === 'dark' ? '#fbbf24' : '#64748b',
                transition: 'all 0.15s ease',
              }}
              title={colorMode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-label="Toggle theme"
            >
              {colorMode === 'dark' ? <Sun size={13} /> : <Moon size={13} />}
            </button>
          </HStack>
        </Flex>

        <Flex bg="var(--bg-nav)" p={1} borderRadius="xl" justify="space-between" gap={1}>
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
                  background: isActive ? 'var(--bg-nav-active)' : 'transparent',
                  color: isActive ? 'var(--text-nav-active)' : 'var(--text-muted)',
                  fontSize: '12px',
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  boxShadow: isActive ? 'var(--shadow-card)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                <Icon
                  size={14}
                  strokeWidth={isActive ? 2.3 : 1.8}
                  color={isActive ? 'var(--color-accent)' : 'var(--text-muted)'}
                />
                <span>{label}</span>
              </button>
            );
          })}
        </Flex>
      </Box>
    </Box>
  );
};
