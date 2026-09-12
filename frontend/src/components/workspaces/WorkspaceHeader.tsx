'use client';

import React from 'react';
import { Flex, HStack, IconButton, Text, VStack } from '@chakra-ui/react';
import { useColorMode } from '@/components/ui/color-mode';
import { BrandLogoIcon, ThemeMoonIcon, ThemeSunIcon } from '@/components/icons';
import { APP_CONFIG } from '@/config/appConfig';

export const WorkspaceHeader: React.FC = () => {
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <Flex as="header" align="center" justify="space-between" gap={3} pt={1.5} pb={0.5}>
      <HStack gap="11px" align="center">
        <BrandLogoIcon aria-label={`${APP_CONFIG.name} logo`} />
        <VStack align="start" gap="1px">
          <Text
            fontFamily="'Instrument Sans', system-ui, sans-serif"
            fontSize="16px"
            fontWeight="600"
            letterSpacing="-0.02em"
            color="var(--hh-ink, #1C1A17)"
            lineHeight="1.2"
          >
            {APP_CONFIG.name}
          </Text>
          <Text
            fontFamily="'Instrument Sans', system-ui, sans-serif"
            fontSize="11px"
            fontWeight="500"
            letterSpacing="0.1em"
            textTransform="uppercase"
            color="var(--hh-muted, #857C70)"
            lineHeight="1.2"
          >
            {APP_CONFIG.tagline}
          </Text>
        </VStack>
      </HStack>

      <IconButton
        onClick={toggleColorMode}
        aria-label="Toggle theme"
        variant="outline"
        w="40px"
        h="40px"
        minW="40px"
        borderRadius="12px"
        borderColor="var(--hh-line, #E2DACE)"
        bg="var(--hh-card, #FBF9F6)"
        color="var(--hh-ink, #1C1A17)"
        cursor="pointer"
        transition="transform 160ms ease, background 200ms ease, border-color 200ms ease"
        _hover={{
          transform: 'translateY(-1px)',
          bg: 'var(--hh-cardHover, #FFFFFF)',
        }}
        _focusVisible={{
          outline: '2px solid var(--hh-accent, #2F5D8A)',
          outlineOffset: '2px',
        }}
      >
        {colorMode === 'dark' ? <ThemeSunIcon /> : <ThemeMoonIcon />}
      </IconButton>
    </Flex>
  );
};

WorkspaceHeader.displayName = 'WorkspaceHeader';
