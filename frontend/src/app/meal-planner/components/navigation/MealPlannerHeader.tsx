'use client';

import React from 'react';
import Link from 'next/link';
import { Box, Flex, IconButton, Text } from '@chakra-ui/react';
import { ArrowLeft, Settings, Share2 } from 'lucide-react';
import { useColorMode } from '@/components/ui/color-mode';
import { ThemeMoonIcon, ThemeSunIcon } from '@/components/icons';
import { APP_CONFIG } from '@/config/appConfig';
import { iconButtonProps } from '../../constants';

interface MealPlannerHeaderProps {
  onShare: () => void;
  onSetup: () => void;
}

export const MealPlannerHeader: React.FC<MealPlannerHeaderProps> = ({ onShare, onSetup }) => {
  const { colorMode, toggleColorMode } = useColorMode();
  const isDark = colorMode === 'dark';

  return (
    <Flex as="header" align="center" justify="space-between" gap="12px" pt="4px">
      <Flex align="center" gap="12px" minW="0">
        <IconButton
          asChild
          aria-label="Back to hub"
          {...iconButtonProps}
          _hover={{ transform: 'translateX(-1px)', bg: 'var(--hh-cardHover)' }}
        >
          <Link href="/">
            <ArrowLeft size={17} strokeWidth={1.9} />
          </Link>
        </IconButton>
        <Box minW="0">
          <Text
            fontFamily="'Instrument Serif', Georgia, serif"
            fontSize="25px"
            lineHeight="1.1"
            color="var(--hh-ink)"
            m={0}
          >
            Meal Planner
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
      <Flex gap="7px">
        <IconButton type="button" aria-label="Send the menu" onClick={onShare} {...iconButtonProps}>
          <Share2 size={16} strokeWidth={1.8} />
        </IconButton>
        <IconButton type="button" aria-label="Planner setup" onClick={onSetup} {...iconButtonProps}>
          <Settings size={16} strokeWidth={1.8} />
        </IconButton>
        <IconButton
          type="button"
          aria-label="Toggle theme"
          onClick={toggleColorMode}
          {...iconButtonProps}
        >
          {isDark ? (
            <ThemeSunIcon size={16} strokeWidth={1.8} />
          ) : (
            <ThemeMoonIcon size={16} strokeWidth={1.8} />
          )}
        </IconButton>
      </Flex>
    </Flex>
  );
};
