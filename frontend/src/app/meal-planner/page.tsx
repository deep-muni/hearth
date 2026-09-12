'use client';

import React from 'react';
import { Box } from '@chakra-ui/react';
import { MealPlannerView } from './components/MealPlannerView';

export default function MealPlannerPage() {
  return (
    <Box
      minH="100vh"
      bg="var(--hh-paper)"
      color="var(--hh-ink)"
      transition="background-color 260ms ease, color 260ms ease"
    >
      <Box
        as="main"
        maxW="520px"
        w="100%"
        mx="auto"
        px="20px"
        pt="20px"
        pb="88px"
        display="flex"
        flexDirection="column"
        gap="16px"
      >
        <MealPlannerView />
      </Box>
    </Box>
  );
}
