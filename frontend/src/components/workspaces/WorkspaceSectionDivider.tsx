import React from 'react';
import { Box, HStack, Text } from '@chakra-ui/react';

export interface WorkspaceSectionDividerProps {
  label?: string;
}

export const WorkspaceSectionDivider: React.FC<WorkspaceSectionDividerProps> = ({
  label = 'Workspaces',
}) => {
  return (
    <HStack gap={3} px="2px" py="2px" align="center" w="100%">
      <Text
        fontFamily="'Instrument Sans', system-ui, sans-serif"
        fontSize="11px"
        fontWeight="600"
        letterSpacing="0.12em"
        textTransform="uppercase"
        color="var(--hh-muted, #857C70)"
        m={0}
      >
        {label}
      </Text>
      <Box flex="1" h="1px" bg="var(--hh-line, #E2DACE)" />
    </HStack>
  );
};

WorkspaceSectionDivider.displayName = 'WorkspaceSectionDivider';
