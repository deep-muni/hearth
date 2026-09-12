'use client';

import React from 'react';
import { Flex, Text } from '@chakra-ui/react';
import { X } from 'lucide-react';
import { UndoState } from '../../types';

interface UndoToastProps {
  toast: UndoState;
  onClose: () => void;
}

export const UndoToast: React.FC<UndoToastProps> = ({ toast, onClose }) => {
  return (
    <Flex
      position="fixed"
      left="50%"
      bottom="22px"
      transform="translateX(-50%)"
      zIndex={1100}
      align="center"
      gap="10px"
      py="12px"
      pl="18px"
      pr="10px"
      borderRadius="999px"
      bg="var(--hh-ink)"
      color="var(--hh-paper)"
      boxShadow="0 18px 36px -18px rgba(20, 17, 14, 0.6)"
      animation="hubRise 220ms ease both"
      aria-live="polite"
    >
      <Text fontSize="13px" whiteSpace="nowrap">
        {toast.text}
      </Text>
      <button
        type="button"
        onClick={() => {
          void toast.restore();
          onClose();
        }}
        style={{
          border: 0,
          borderRadius: 999,
          background: 'rgba(255,255,255,0.14)',
          color: 'inherit',
          minHeight: 30,
          padding: '0 11px',
          fontSize: '12.5px',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        Undo
      </button>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={onClose}
        style={{
          width: 28,
          height: 28,
          borderRadius: 999,
          border: 0,
          background: 'transparent',
          color: 'inherit',
          cursor: 'pointer',
          display: 'grid',
          placeItems: 'center',
        }}
      >
        <X size={14} />
      </button>
    </Flex>
  );
};
