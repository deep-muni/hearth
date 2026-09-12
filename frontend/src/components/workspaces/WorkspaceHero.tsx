import React from 'react';
import { Heading, Text, VStack } from '@chakra-ui/react';
import { APP_CONFIG } from '@/config/appConfig';
import { DatePill } from './DatePill';

export const WorkspaceHero: React.FC = () => {
  return (
    <VStack
      as="section"
      align="start"
      gap="14px"
      pt={1}
      px="2px"
      animation="hubRise 500ms ease both"
    >
      <DatePill />

      <Heading
        as="h1"
        fontFamily="'Instrument Serif', Georgia, serif"
        fontWeight="400"
        fontSize="clamp(34px, 9vw, 46px)"
        lineHeight="1.04"
        letterSpacing="-0.02em"
        color="var(--hh-ink, #1C1A17)"
        m={0}
      >
        {APP_CONFIG.headlineLine1}
        <br />
        <Text as="em" fontStyle="italic" color="var(--hh-accentInk, #233F5B)">
          {APP_CONFIG.headlineLine2}
        </Text>
      </Heading>

      <Text
        fontFamily="'Instrument Sans', system-ui, sans-serif"
        fontSize="15px"
        lineHeight="1.55"
        color="var(--hh-muted, #6F665B)"
        maxW="40ch"
        m={0}
      >
        {APP_CONFIG.subcopy}
      </Text>
    </VStack>
  );
};

WorkspaceHero.displayName = 'WorkspaceHero';
