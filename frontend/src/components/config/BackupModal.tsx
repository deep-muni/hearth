'use client';

import React, { useState } from 'react';
import { HStack, Text, Box } from '@chakra-ui/react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (json: string) => boolean;
}

export const BackupModal: React.FC<BackupModalProps> = ({ isOpen, onClose, onImport }) => {
  const [jsonText, setJsonText] = useState('');
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  const handleImport = () => {
    if (!jsonText.trim()) return;
    const success = onImport(jsonText);
    if (success) {
      setStatusMsg({ type: 'success', text: 'Data restored successfully!' });
      setTimeout(() => {
        setJsonText('');
        setStatusMsg(null);
        onClose();
      }, 700);
    } else {
      setStatusMsg({ type: 'error', text: 'Invalid backup JSON. Please check and try again.' });
    }
  };

  const handleClose = () => {
    setStatusMsg(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Restore JSON Backup"
      description="Paste valid JSON data previously exported from HouseHelp"
      maxWidth="340px"
    >
      <textarea
        rows={5}
        value={jsonText}
        onChange={(e) => {
          setJsonText(e.target.value);
          if (statusMsg) setStatusMsg(null);
        }}
        placeholder="Paste JSON string here..."
        style={{
          width: '100%',
          padding: '8px',
          borderRadius: '8px',
          border: `1px solid ${statusMsg?.type === 'error' ? '#ef4444' : '#e2e8f0'}`,
          fontSize: '11px',
          fontFamily: 'monospace',
          outline: 'none',
          marginBottom: '8px',
          boxSizing: 'border-box',
        }}
      />

      {statusMsg && (
        <Box mb={2}>
          <Text
            fontSize="11px"
            fontWeight="600"
            color={statusMsg.type === 'success' ? '#10b981' : '#ef4444'}
          >
            {statusMsg.text}
          </Text>
        </Box>
      )}

      <HStack justify="flex-end" gap={1.5}>
        <Button variant="outline" size="sm" onClick={handleClose}>
          Cancel
        </Button>
        <Button variant="primary" size="sm" onClick={handleImport}>
          Import
        </Button>
      </HStack>
    </Modal>
  );
};
