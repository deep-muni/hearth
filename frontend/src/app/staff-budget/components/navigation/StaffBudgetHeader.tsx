'use client';

import React from 'react';
import Link from 'next/link';
import { Flex, Box, Text, IconButton } from '@chakra-ui/react';
import { useColorMode } from '@/components/ui/color-mode';
import { ChevronLeftIcon, ThemeSunIcon, ThemeMoonIcon } from '@/components/icons';
import { APP_CONFIG } from '@/config/appConfig';

export const StaffBudgetHeader: React.FC = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const isDark = colorMode === 'dark';

  return (
    <Flex as="header" align="center" justify="space-between" gap="12px" pt="4px">
      <Flex align="center" gap="12px" minW="0">
        <IconButton
          asChild
          aria-label="Back to hub"
          variant="outline"
          w="38px"
          h="38px"
          minW="38px"
          borderRadius="12px"
          border="1px solid var(--hh-line)"
          bg="var(--hh-card)"
          color="var(--hh-ink)"
          transition="transform 160ms ease, background 200ms ease"
          _hover={{
            transform: 'translateX(-1px)',
            bg: 'var(--hh-cardHover)',
          }}
        >
          <Link href="/">
            <ChevronLeftIcon size={17} strokeWidth={2} />
          </Link>
        </IconButton>
        <Box minW="0">
          <Text
            fontFamily="'Instrument Serif', Georgia, serif"
            fontSize="25px"
            lineHeight="1.1"
            letterSpacing="-0.01em"
            color="var(--hh-ink)"
            m={0}
          >
            Staff &amp; Budget
          </Text>
          <Text
            fontFamily="'Instrument Sans', system-ui, sans-serif"
            fontSize="10.5px"
            fontWeight={600}
            letterSpacing="0.12em"
            textTransform="uppercase"
            color="var(--hh-muted)"
            m={0}
          >
            {APP_CONFIG.name}
          </Text>
        </Box>
      </Flex>

      <IconButton
        type="button"
        onClick={toggleColorMode}
        aria-label="Toggle theme"
        variant="outline"
        w="38px"
        h="38px"
        minW="38px"
        borderRadius="12px"
        border="1px solid var(--hh-line)"
        bg="var(--hh-card)"
        color="var(--hh-ink)"
        transition="transform 160ms ease, background 200ms ease"
        _hover={{
          transform: 'translateY(-1px)',
          bg: 'var(--hh-cardHover)',
        }}
      >
        {isDark ? (
          <ThemeSunIcon size={16} strokeWidth={1.8} />
        ) : (
          <ThemeMoonIcon size={16} strokeWidth={1.8} />
        )}
      </IconButton>
    </Flex>
  );
};
