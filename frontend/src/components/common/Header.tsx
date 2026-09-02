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
  Calendar as CalendarIcon,
  Wallet,
  Users,
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
      {/* Top Bar */}
      <Box
        as="header"
        bg="rgba(255, 255, 255, 0.95)"
        backdropFilter="blur(12px)"
        borderBottom="1px solid #f1f5f9"
        py={2.5}
        px={{ base: 3, md: 6 }}
        position="sticky"
        top={0}
        zIndex={40}
      >
        <Flex
          align="center"
          justify="space-between"
          maxW="900px"
          mx="auto"
          gap={2}
        >
          {/* Brand */}
          <HStack gap={1.5}>
            <Text fontSize="18px">🌸</Text>
            <Text fontSize="md" fontWeight="800" color="#e11d48" letterSpacing="-0.3px">
              HouseHelp
            </Text>
          </HStack>

          {/* Compact Month Switcher */}
          <HStack
            bg="#fff1f2"
            border="1px solid #fecdd3"
            borderRadius="full"
            px={1}
            py={0.5}
            gap={0.5}
          >
            <button
              onClick={() => onMonthChange(getPreviousMonth(currentMonth))}
              aria-label="Previous month"
              style={{
                background: 'transparent',
                border: 'none',
                padding: '5px 7px',
                cursor: 'pointer',
                color: '#e11d48',
                display: 'flex',
                alignItems: 'center',
                borderRadius: '9999px',
              }}
            >
              <ChevronLeft size={16} strokeWidth={2.5} />
            </button>

            <Text
              fontSize="xs"
              fontWeight="700"
              color="#9f1239"
              minW="105px"
              textAlign="center"
              userSelect="none"
            >
              {formatMonthDisplay(currentMonth)}
            </Text>

            <button
              onClick={() => onMonthChange(getNextMonth(currentMonth))}
              aria-label="Next month"
              style={{
                background: 'transparent',
                border: 'none',
                padding: '5px 7px',
                cursor: 'pointer',
                color: '#e11d48',
                display: 'flex',
                alignItems: 'center',
                borderRadius: '9999px',
              }}
            >
              <ChevronRight size={16} strokeWidth={2.5} />
            </button>
          </HStack>

          {/* Total Budget Pill & Desktop Tabs */}
          <HStack gap={2}>
            <Box
              bg="#ecfdf5"
              border="1px solid #a7f3d0"
              borderRadius="full"
              px={2.5}
              py={1}
              fontSize="11px"
              fontWeight="800"
              color="#065f46"
            >
              {formatCurrency(totalMonthlyBudget)}
            </Box>

            {/* Desktop-only Tab Switcher */}
            <HStack display={{ base: 'none', md: 'flex' }} gap={1} bg="#f8fafc" p={1} borderRadius="full" border="1px solid #e2e8f0">
              <button
                onClick={() => onTabChange('calendar')}
                style={{
                  padding: '5px 12px',
                  borderRadius: '9999px',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: activeTab === 'calendar' ? 700 : 500,
                  background: activeTab === 'calendar' ? '#ffffff' : 'transparent',
                  color: activeTab === 'calendar' ? '#e11d48' : '#64748b',
                  boxShadow: activeTab === 'calendar' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  cursor: 'pointer',
                }}
              >
                Calendar
              </button>
              <button
                onClick={() => onTabChange('summary')}
                style={{
                  padding: '5px 12px',
                  borderRadius: '9999px',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: activeTab === 'summary' ? 700 : 500,
                  background: activeTab === 'summary' ? '#ffffff' : 'transparent',
                  color: activeTab === 'summary' ? '#e11d48' : '#64748b',
                  boxShadow: activeTab === 'summary' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  cursor: 'pointer',
                }}
              >
                Summary
              </button>
              <button
                onClick={() => onTabChange('config')}
                style={{
                  padding: '5px 12px',
                  borderRadius: '9999px',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: activeTab === 'config' ? 700 : 500,
                  background: activeTab === 'config' ? '#ffffff' : 'transparent',
                  color: activeTab === 'config' ? '#e11d48' : '#64748b',
                  boxShadow: activeTab === 'config' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  cursor: 'pointer',
                }}
              >
                Staff
              </button>
            </HStack>
          </HStack>
        </Flex>
      </Box>

      {/* Mobile Bottom Navigation Bar (iPhone 14 / iPhone 16 optimized) */}
      <Box
        display={{ base: 'block', md: 'none' }}
        position="fixed"
        bottom={0}
        left={0}
        right={0}
        bg="rgba(255, 255, 255, 0.96)"
        backdropFilter="blur(16px)"
        borderTop="1px solid #f1f5f9"
        zIndex={50}
        px={3}
        pt={1.5}
        pb="calc(env(safe-area-inset-bottom, 8px) + 6px)"
      >
        <Flex justify="space-around" align="center" maxW="400px" mx="auto">
          <button
            onClick={() => onTabChange('calendar')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px',
              border: 'none',
              background: 'transparent',
              color: activeTab === 'calendar' ? '#e11d48' : '#94a3b8',
              cursor: 'pointer',
              padding: '4px 14px',
            }}
          >
            <CalendarIcon size={20} strokeWidth={activeTab === 'calendar' ? 2.5 : 1.8} />
            <Text fontSize="10px" fontWeight={activeTab === 'calendar' ? '800' : '600'}>
              Calendar
            </Text>
          </button>

          <button
            onClick={() => onTabChange('summary')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px',
              border: 'none',
              background: 'transparent',
              color: activeTab === 'summary' ? '#e11d48' : '#94a3b8',
              cursor: 'pointer',
              padding: '4px 14px',
            }}
          >
            <Wallet size={20} strokeWidth={activeTab === 'summary' ? 2.5 : 1.8} />
            <Text fontSize="10px" fontWeight={activeTab === 'summary' ? '800' : '600'}>
              Summary
            </Text>
          </button>

          <button
            onClick={() => onTabChange('config')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px',
              border: 'none',
              background: 'transparent',
              color: activeTab === 'config' ? '#e11d48' : '#94a3b8',
              cursor: 'pointer',
              padding: '4px 14px',
            }}
          >
            <Users size={20} strokeWidth={activeTab === 'config' ? 2.5 : 1.8} />
            <Text fontSize="10px" fontWeight={activeTab === 'config' ? '800' : '600'}>
              Staff
            </Text>
          </button>
        </Flex>
      </Box>
    </>
  );
};
