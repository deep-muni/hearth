"use client";

import React, { useState } from 'react';
import {
  Box,
  Flex,
  HStack,
  VStack,
  Text,
} from '@chakra-ui/react';
import { HouseHelp } from '@/types';
import { formatCurrency } from '@/utils/dateUtils';
import { StaffFormModal } from './StaffFormModal';
import { BackupModal } from './BackupModal';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  Plus,
  Edit2,
  Trash2,
  Download,
  Upload,
  RotateCcw,
} from 'lucide-react';

interface ConfigViewProps {
  helpers: HouseHelp[];
  onSaveHelper: (helper: HouseHelp) => void;
  onDeleteHelper: (id: string) => void;
  onResetDemo: () => void;
  onExportBackup: () => void;
  onImportBackup: (json: string) => boolean;
}

const WEEKDAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const ConfigView: React.FC<ConfigViewProps> = ({
  helpers,
  onSaveHelper,
  onDeleteHelper,
  onResetDemo,
  onExportBackup,
  onImportBackup,
}) => {
  const [editingHelper, setEditingHelper] = useState<HouseHelp | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);

  const handleOpenAdd = () => {
    setEditingHelper(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (h: HouseHelp) => {
    setEditingHelper(h);
    setIsFormModalOpen(true);
  };

  return (
    <VStack gap={3} align="stretch" w="100%">
      {/* 1. Header with Add Button */}
      <Flex justify="space-between" align="center" px={1}>
        <Text fontSize="14px" fontWeight="700" color="#0f172a">
          Staff Members ({helpers.length})
        </Text>

        <Button
          variant="primary"
          size="xs"
          onClick={handleOpenAdd}
          icon={<Plus size={13} strokeWidth={2.5} />}
        >
          Add Staff
        </Button>
      </Flex>

      {/* 2. Staff Cards */}
      <VStack gap={2} align="stretch">
        {helpers.map((h) => (
          <Card key={h.id} style={{ padding: '12px' }}>
            <Flex justify="space-between" align="center">
              <HStack gap={2.5}>
                <Text fontSize="20px">{h.avatarEmoji}</Text>
                <Box>
                  <Text fontSize="13px" fontWeight="700" color="#0f172a">
                    {h.name}
                  </Text>
                  <Text fontSize="11px" color="#64748b">
                    {h.role} • {formatCurrency(h.baseSalary)}
                    {h.salaryType === 'DAILY_WAGE' ? '/day' : '/mo'}
                  </Text>
                  <Text fontSize="10px" color="#94a3b8">
                    {h.paidLeavesAllowance} free leaves • Off:{' '}
                    {h.weeklyOffDay >= 0 ? WEEKDAY_NAMES[h.weeklyOffDay] : 'None'}
                  </Text>
                </Box>
              </HStack>

              <HStack gap={1}>
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => handleOpenEdit(h)}
                  icon={<Edit2 size={12} />}
                  aria-label="Edit staff member"
                  style={{ padding: '5px 7px' }}
                />

                <Button
                  variant="danger"
                  size="xs"
                  onClick={() => {
                    if (confirm(`Remove ${h.name}?`)) {
                      onDeleteHelper(h.id);
                    }
                  }}
                  icon={<Trash2 size={12} />}
                  aria-label="Delete staff member"
                  style={{ padding: '5px 7px' }}
                />
              </HStack>
            </Flex>
          </Card>
        ))}
      </VStack>

      {/* 3. Minimal Backup / Reset Footer */}
      <Flex justify="center" gap={3} pt={3} pb={4} fontSize="11px" color="#94a3b8">
        <button
          onClick={onExportBackup}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: '#64748b',
            display: 'flex',
            alignItems: 'center',
            gap: '3px',
          }}
        >
          <Download size={11} /> Backup
        </button>
        <span>•</span>
        <button
          onClick={() => setIsBackupModalOpen(true)}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: '#64748b',
            display: 'flex',
            alignItems: 'center',
            gap: '3px',
          }}
        >
          <Upload size={11} /> Restore
        </button>
        <span>•</span>
        <button
          onClick={onResetDemo}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: '#64748b',
            display: 'flex',
            alignItems: 'center',
            gap: '3px',
          }}
        >
          <RotateCcw size={11} /> Reset Demo
        </button>
      </Flex>

      {/* Modals */}
      <StaffFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        helper={editingHelper}
        onSave={onSaveHelper}
      />

      <BackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        onImport={onImportBackup}
      />
    </VStack>
  );
};
