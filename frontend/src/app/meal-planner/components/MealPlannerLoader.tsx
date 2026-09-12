'use client';

import React from 'react';
import { Box, Flex, Text, Spinner } from '@chakra-ui/react';

interface MealPlannerLoaderProps {
  message?: string;
  minH?: string;
}

export const MealPlannerLoader: React.FC<MealPlannerLoaderProps> = ({
  message = 'Loading meal planner...',
  minH = '260px',
}) => {
  return (
    <Flex
      align="center"
      justify="center"
      direction="column"
      gap="16px"
      minH={minH}
      p="32px 20px"
      borderRadius="22px"
      bg="var(--hh-card)"
      border="1px solid var(--hh-line)"
      boxShadow="0 1px 2px rgba(28, 26, 23, 0.03)"
      animation="hubFade 240ms ease both"
      textAlign="center"
    >
      <Box position="relative" display="inline-flex" alignItems="center" justifyContent="center">
        <Spinner
          size="lg"
          color="var(--hh-accent)"
          css={{
            borderWidth: '2.5px',
            borderTopColor: 'transparent',
          }}
        />
      </Box>

      <Box>
        <Text
          fontFamily="'Instrument Serif', Georgia, serif"
          fontSize="20px"
          color="var(--hh-ink)"
          m={0}
        >
          {message}
        </Text>
        <Text
          fontFamily="'Instrument Sans', system-ui, sans-serif"
          fontSize="12.5px"
          color="var(--hh-muted)"
          mt="4px"
          m={0}
        >
          Fetching weekly menus, routines, and dish library
        </Text>
      </Box>
    </Flex>
  );
};
