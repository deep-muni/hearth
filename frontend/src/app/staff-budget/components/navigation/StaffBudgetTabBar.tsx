'use client';

import React from 'react';
import { Grid, Button } from '@chakra-ui/react';
import { ActiveTab } from '../../types';

interface StaffBudgetTabBarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

export const StaffBudgetTabBar: React.FC<StaffBudgetTabBarProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'calendar' as const, label: 'Calendar' },
    { id: 'summary' as const, label: 'Summary' },
    { id: 'config' as const, label: 'Staff' },
  ];

  return (
    <Grid
      as="nav"
      templateColumns="repeat(3, minmax(0, 1fr))"
      gap="4px"
      p="4px"
      borderRadius="16px"
      bg="var(--hh-sunken)"
      border="1px solid var(--hh-line)"
      aria-label="Staff & Budget Tabs"
    >
      {tabs.map(({ id, label }) => {
        const isActive = activeTab === id;
        return (
          <Button
            key={id}
            type="button"
            variant="ghost"
            onClick={() => onTabChange(id)}
            py="11px"
            px="8px"
            h="auto"
            minH="40px"
            borderRadius="12px"
            fontFamily="'Instrument Sans', system-ui, sans-serif"
            fontSize="13.5px"
            fontWeight={600}
            letterSpacing="-0.01em"
            bg={isActive ? 'var(--hh-card)' : 'transparent'}
            color={isActive ? 'var(--hh-ink)' : 'var(--hh-muted)'}
            boxShadow={isActive ? '0 1px 3px rgba(28, 26, 23, 0.10)' : 'none'}
            transition="background 200ms ease, color 200ms ease, box-shadow 200ms ease"
            _hover={{
              bg: isActive ? 'var(--hh-card)' : 'rgba(0, 0, 0, 0.04)',
              color: 'var(--hh-ink)',
            }}
          >
            {label}
          </Button>
        );
      })}
    </Grid>
  );
};
