"use client";

import React from 'react';
import {
  Box,
  Flex,
  HStack,
  Text,
  Badge,
  IconButton,
} from '@chakra-ui/react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  DollarSign,
  Users,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import {
  formatMonthDisplay,
  getNextMonth,
  getPreviousMonth,
  getCurrentMonth,
} from '@/utils/dateUtils';

interface HeaderProps {
  currentMonth: string;
  onMonthChange: (newMonth: string) => void;
  activeTab: 'calendar' | 'summary' | 'config';
  onTabChange: (tab: 'calendar' | 'summary' | 'config') => void;
  totalMonthlyBudget: number;
  totalHelpersCount: number;
  onResetDemo: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentMonth,
  onMonthChange,
  activeTab,
  onTabChange,
  totalMonthlyBudget,
  totalHelpersCount,
  onResetDemo,
}) => {
  const isActualCurrentMonth = currentMonth === getCurrentMonth();

  return (
    <Box
      as="header"
      bg="rgba(255, 255, 255, 0.9)"
      backdropFilter="blur(10px)"
      borderBottom="1px solid"
      borderColor="pink.100"
      py={4}
      px={{ base: 4, md: 8 }}
      position="sticky"
      top={0}
      zIndex={30}
      boxShadow="0 4px 20px -2px rgba(255, 182, 193, 0.15)"
    >
      <Flex
        direction={{ base: 'column', md: 'row' }}
        align="center"
        justify="space-between"
        gap={4}
        maxW="1400px"
        mx="auto"
      >
        {/* Logo & Brand */}
        <HStack gap={3}>
          <Box
            w="48px"
            h="48px"
            bg="pink.50"
            border="2px solid"
            borderColor="pink.200"
            borderRadius="2xl"
            display="flex"
            alignItems="center"
            justifyContent="center"
            fontSize="26px"
            boxShadow="0 2px 8px rgba(255, 107, 139, 0.2)"
            className="cute-float"
          >
            🌸
          </Box>
          <Box>
            <HStack gap={2}>
              <Text
                fontSize={{ base: 'xl', md: '2xl' }}
                fontWeight="800"
                bgGradient="to-r"
                gradientFrom="pink.500"
                gradientTo="purple.600"
                color="pink.600"
                letterSpacing="-0.5px"
              >
                HouseHelp Budget
              </Text>
              <Badge
                bg="purple.50"
                color="purple.600"
                border="1px solid"
                borderColor="purple.200"
                borderRadius="full"
                px={2.5}
                py={0.5}
                fontSize="xs"
                fontWeight="bold"
              >
                Cute Edition ✨
              </Badge>
            </HStack>
            <Text fontSize="xs" color="gray.500" fontWeight="500">
              Happy staff, happy home • Monthly attendance & smart salary calculator
            </Text>
          </Box>
        </HStack>

        {/* Month Picker / Navigator */}
        <HStack
          bg="pink.50"
          border="1.5px solid"
          borderColor="pink.200"
          p={1.5}
          borderRadius="2xl"
          boxShadow="inner"
        >
          <button
            onClick={() => onMonthChange(getPreviousMonth(currentMonth))}
            title="Previous Month"
            style={{
              padding: '6px 10px',
              borderRadius: '12px',
              border: 'none',
              background: '#ffffff',
              cursor: 'pointer',
              color: '#d53f8c',
              display: 'flex',
              alignItems: 'center',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            }}
          >
            <ChevronLeft size={18} />
          </button>

          <HStack px={3} gap={2}>
            <Text fontSize="sm" fontWeight="800" color="pink.700" minW="135px" textAlign="center">
              📅 {formatMonthDisplay(currentMonth)}
            </Text>
            {!isActualCurrentMonth && (
              <button
                onClick={() => onMonthChange(getCurrentMonth())}
                style={{
                  fontSize: '11px',
                  fontWeight: '700',
                  padding: '3px 8px',
                  borderRadius: '9999px',
                  border: '1px solid #f687b3',
                  background: '#fbb6ce',
                  color: '#702459',
                  cursor: 'pointer',
                }}
              >
                Today
              </button>
            )}
          </HStack>

          <button
            onClick={() => onMonthChange(getNextMonth(currentMonth))}
            title="Next Month"
            style={{
              padding: '6px 10px',
              borderRadius: '12px',
              border: 'none',
              background: '#ffffff',
              cursor: 'pointer',
              color: '#d53f8c',
              display: 'flex',
              alignItems: 'center',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            }}
          >
            <ChevronRight size={18} />
          </button>
        </HStack>

        {/* Navigation Tabs */}
        <HStack gap={2} bg="gray.100" p={1} borderRadius="2xl">
          <button
            onClick={() => onTabChange('calendar')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '14px',
              border: 'none',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              background: activeTab === 'calendar' ? '#ffffff' : 'transparent',
              color: activeTab === 'calendar' ? '#e53e3e' : '#4a5568',
              boxShadow: activeTab === 'calendar' ? '0 2px 8px rgba(229, 62, 62, 0.15)' : 'none',
            }}
          >
            <CalendarIcon size={16} />
            <span>Calendar</span>
          </button>

          <button
            onClick={() => onTabChange('summary')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '14px',
              border: 'none',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              background: activeTab === 'summary' ? '#ffffff' : 'transparent',
              color: activeTab === 'summary' ? '#3182ce' : '#4a5568',
              boxShadow: activeTab === 'summary' ? '0 2px 8px rgba(49, 130, 206, 0.15)' : 'none',
            }}
          >
            <DollarSign size={16} />
            <span>Pay Summary</span>
          </button>

          <button
            onClick={() => onTabChange('config')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '14px',
              border: 'none',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              background: activeTab === 'config' ? '#ffffff' : 'transparent',
              color: activeTab === 'config' ? '#805ad5' : '#4a5568',
              boxShadow: activeTab === 'config' ? '0 2px 8px rgba(128, 90, 213, 0.15)' : 'none',
            }}
          >
            <Users size={16} />
            <span>Staff Config</span>
          </button>

          <button
            onClick={onResetDemo}
            title="Reset to Demo Data"
            style={{
              padding: '8px 10px',
              borderRadius: '14px',
              border: 'none',
              fontWeight: 600,
              fontSize: '12px',
              cursor: 'pointer',
              background: 'transparent',
              color: '#718096',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <RotateCcw size={14} />
          </button>
        </HStack>
      </Flex>
    </Box>
  );
};
