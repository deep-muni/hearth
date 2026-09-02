'use client';

import React, { useState } from 'react';
import { HStack } from '@chakra-ui/react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (json: string) => boolean;
}

export const BackupModal: React.FC<BackupModalProps> = ({ isOpen, onClose, onImport }) => {
  const [jsonText, setJsonText] = useState('');

  const handleImport = () => {
    if (!jsonText.trim()) return;
    const success = onImport(jsonText);
    if (success) {
      alert('Data restored successfully!');
      setJsonText('');
      onClose();
    } else {
      alert('Invalid backup JSON. Please check and try again.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Restore JSON Backup"
      description="Paste valid JSON data previously exported from HouseHelp"
      maxWidth="340px"
    >
      <textarea
        rows={5}
        value={jsonText}
        onChange={(e) => setJsonText(e.target.value)}
        placeholder="Paste JSON string here..."
        style={{
          width: '100%',
          padding: '8px',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          fontSize: '11px',
          fontFamily: 'monospace',
          outline: 'none',
          marginBottom: '10px',
          boxSizing: 'border-box',
        }}
      />

      <HStack justify="flex-end" gap={1.5}>
        <Button variant="outline" size="sm" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" size="sm" onClick={handleImport}>
          Import
        </Button>
      </HStack>
    </Modal>
  );
};
