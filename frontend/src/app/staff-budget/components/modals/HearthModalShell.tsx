'use client';

import React, { useEffect, useCallback } from 'react';
import { Box, Flex, Text, IconButton } from '@chakra-ui/react';
import { CloseCrossIcon } from '@/components/icons';

interface HearthModalShellProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string;
}

export const HearthModalShell: React.FC<HearthModalShellProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth = '430px',
}) => {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <Box
      position="fixed"
      inset={0}
      zIndex={1000}
      display="flex"
      alignItems="center"
      justifyContent="center"
      p="20px"
      bg="rgba(22, 20, 18, 0.42)"
      backdropFilter="blur(3px)"
      animation="hubFade 200ms ease both"
      onClick={onClose}
    >
      <Box
        width="100%"
        maxW={maxWidth}
        maxH="90vh"
        overflowY="auto"
        className="no-scrollbar"
        css={{
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
          msOverflowStyle: 'none',
        }}
        p="22px"
        borderRadius="24px"
        bg="var(--hh-card)"
        border="1px solid var(--hh-line)"
        boxShadow="0 30px 60px -24px rgba(20, 17, 14, 0.5)"
        animation="hubPop 260ms cubic-bezier(0.22, 1, 0.36, 1) both"
        onClick={(e) => e.stopPropagation()}
      >
        <Flex align="flex-start" justify="space-between" gap="14px" mb="18px">
          <Box minW="0">
            {typeof title === 'string' ? (
              <Text
                fontFamily="'Instrument Serif', Georgia, serif"
                fontSize="24px"
                lineHeight="1.15"
                color="var(--hh-ink)"
                m={0}
              >
                {title}
              </Text>
            ) : (
              title
            )}
            {subtitle && (
              <Text
                fontFamily="'Instrument Sans', system-ui, sans-serif"
                fontSize="12.5px"
                color="var(--hh-muted)"
                mt="4px"
                m={0}
              >
                {subtitle}
              </Text>
            )}
          </Box>

          <IconButton
            type="button"
            onClick={onClose}
            aria-label="Close"
            variant="ghost"
            w="32px"
            h="32px"
            minW="32px"
            borderRadius="10px"
            p={0}
            bg="var(--hh-sunken)"
            color="var(--hh-muted)"
            transition="color 180ms ease, background 180ms ease"
            _hover={{
              color: 'var(--hh-ink)',
            }}
          >
            <CloseCrossIcon size={15} strokeWidth={2} />
          </IconButton>
        </Flex>

        <Box>{children}</Box>

        {footer && <Box mt="20px">{footer}</Box>}
      </Box>
    </Box>
  );
};
