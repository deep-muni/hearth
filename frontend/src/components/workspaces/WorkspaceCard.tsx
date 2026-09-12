'use client';

import React from 'react';
import Link from 'next/link';
import { Box, Grid, Text, VStack } from '@chakra-ui/react';
import { ChevronRightIcon } from '@/components/icons';
import { WorkspaceItem } from '@/data/workspaces';

export interface WorkspaceCardProps {
  item: WorkspaceItem;
}

export const WorkspaceCard: React.FC<WorkspaceCardProps> = ({ item }) => {
  const IconComponent = item.icon;

  return (
    <Link href={item.href} style={{ textDecoration: 'none' }}>
      <Grid
        gridTemplateColumns="48px minmax(0, 1fr) 20px"
        alignItems="center"
        gap={4}
        p="20px 18px"
        borderRadius="20px"
        bg="var(--hh-card, #FBF9F6)"
        border="1px solid"
        borderColor="var(--hh-line, #E2DACE)"
        boxShadow="0 1px 2px rgba(28, 26, 23, 0.03)"
        outline="none"
        transition="transform 180ms ease, box-shadow 220ms ease, border-color 200ms ease"
        _hover={{
          transform: 'translateY(-2px)',
          boxShadow: '0 12px 28px -14px rgba(28, 26, 23, 0.28)',
          borderColor: 'var(--hh-accent, #2F5D8A)',
          '& .workspace-chevron': {
            color: 'var(--hh-accent, #2F5D8A)',
            transform: 'translateX(2px)',
          },
        }}
        _focusVisible={{
          outline: '2px solid var(--hh-accent, #2F5D8A)',
          outlineOffset: '2px',
          borderColor: 'var(--hh-accent, #2F5D8A)',
        }}
      >
        <Box
          w="48px"
          h="48px"
          display="flex"
          alignItems="center"
          justifyContent="center"
          borderRadius="15px"
          bg="var(--hh-accentSoft, #DCE5EE)"
          color="var(--hh-accentInk, #233F5B)"
          flexShrink={0}
        >
          <IconComponent size={23} />
        </Box>

        <VStack align="start" gap="5px" minW={0}>
          <Text
            fontFamily="'Instrument Sans', system-ui, sans-serif"
            fontSize="17px"
            fontWeight="600"
            letterSpacing="-0.015em"
            color="var(--hh-ink, #1C1A17)"
            m={0}
          >
            {item.title}
          </Text>
          <Text
            fontFamily="'Instrument Sans', system-ui, sans-serif"
            fontSize="13.5px"
            lineHeight="1.5"
            color="var(--hh-muted, #6F665B)"
            m={0}
          >
            {item.description}
          </Text>
        </VStack>

        <Box
          className="workspace-chevron"
          display="flex"
          alignItems="center"
          justifyContent="center"
          color="var(--hh-muted, #A79C8E)"
          flexShrink={0}
          transition="transform 160ms ease, color 160ms ease"
        >
          <ChevronRightIcon size={18} />
        </Box>
      </Grid>
    </Link>
  );
};

WorkspaceCard.displayName = 'WorkspaceCard';
