'use client';

import React from 'react';
import { Flex } from '@chakra-ui/react';

interface SegmentedProps {
  value: string;
  options: [string, string][];
  onChange: (value: string) => void;
}

export const Segmented: React.FC<SegmentedProps> = ({ value, options, onChange }) => {
  return (
    <Flex bg="var(--hh-sunken)" p="4px" borderRadius="14px" gap="4px">
      {options.map(([optionValue, label]) => (
        <button
          key={optionValue}
          type="button"
          onClick={() => onChange(optionValue)}
          style={{
            flex: 1,
            minHeight: 36,
            border: 0,
            borderRadius: 11,
            background: value === optionValue ? 'var(--hh-card)' : 'transparent',
            color: value === optionValue ? 'var(--hh-ink)' : 'var(--hh-muted)',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: value === optionValue ? '0 1px 3px rgba(28, 26, 23, 0.10)' : 'none',
          }}
        >
          {label}
        </button>
      ))}
    </Flex>
  );
};
