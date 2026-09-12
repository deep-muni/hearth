'use client';

import React from 'react';
import Link from 'next/link';
import { Box, Flex, HStack, IconButton, Text } from '@chakra-ui/react';
import { ArrowLeft, Sparkles, Sun, Moon } from 'lucide-react';
import { useColorMode } from '@/components/ui/color-mode';
import { APP_CONFIG } from '@/config/appConfig';

export interface NavbarProps {
  moduleName?: string;
  moduleIcon?: string;
  backHref?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ moduleName, moduleIcon, backHref = '/' }) => {
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
      h="52px"
      display="flex"
      alignItems="center"
      transition="background-color 0.15s ease, border-color 0.15s ease"
    >
      <Box w="100%" maxW="440px" mx="auto" px={3}>
        <Flex align="center" justify="space-between">
          {moduleName ? (
            <Link href={backHref} style={{ textDecoration: 'none' }}>
              <HStack
                gap={1.5}
                bg="var(--bg-card-subtle)"
                px={2.5}
                py={1.5}
                borderRadius="10px"
                border="1px solid var(--border-color)"
                cursor="pointer"
                _hover={{ bg: 'var(--bg-card-hover)' }}
                transition="all 0.15s ease"
              >
                <ArrowLeft size={13} color="var(--text-muted)" />
                {moduleIcon && <span style={{ fontSize: '13px' }}>{moduleIcon}</span>}
                <Text fontSize="12px" fontWeight="700" color="var(--text-primary)">
                  {moduleName}
                </Text>
              </HStack>
            </Link>
          ) : (
            <HStack gap={1.5}>
              <Sparkles size={16} color="var(--color-accent)" />
              <Text
                fontSize="14px"
                fontWeight="800"
                color="var(--text-primary)"
                letterSpacing="-0.3px"
              >
                {APP_CONFIG.name}
              </Text>
            </HStack>
          )}

          <IconButton
            onClick={toggleColorMode}
            variant="ghost"
            size="xs"
            borderRadius="8px"
            border="1px solid var(--border-color)"
            bg="var(--bg-card-subtle)"
            color={colorMode === 'dark' ? '#fbbf24' : '#64748b'}
            aria-label="Toggle theme"
            title={colorMode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            _hover={{ bg: 'var(--bg-card-hover)' }}
            transition="all 0.15s ease"
          >
            {colorMode === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          </IconButton>
        </Flex>
      </Box>
    </Box>
  );
};
