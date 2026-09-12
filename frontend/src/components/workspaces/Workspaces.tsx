'use client';

import React from 'react';
import { Box, VStack } from '@chakra-ui/react';
import { WORKSPACES } from '@/data/workspaces';
import { WorkspaceHeader } from './WorkspaceHeader';
import { WorkspaceHero } from './WorkspaceHero';
import { WorkspaceSectionDivider } from './WorkspaceSectionDivider';
import { WorkspaceCard } from './WorkspaceCard';

export interface WorkspacesProps {
  currentRoute?: string;
}

export const Workspaces: React.FC<WorkspacesProps> = () => {
  return (
    <Box
      minH="100vh"
      bg="var(--hh-paper, #EFEAE2)"
      color="var(--hh-ink, #1C1A17)"
      transition="background 260ms ease, color 260ms ease"
    >
      <Box
        maxW="520px"
        mx="auto"
        px="20px"
        pt="20px"
        pb="48px"
        display="flex"
        flexDirection="column"
        gap="22px"
      >
        <WorkspaceHeader />
        <WorkspaceHero />
        <WorkspaceSectionDivider />

        <VStack gap={3} align="stretch">
          {WORKSPACES.map((workspace) => (
            <WorkspaceCard key={workspace.id} item={workspace} />
          ))}
        </VStack>
      </Box>
    </Box>
  );
};

Workspaces.displayName = 'Workspaces';
