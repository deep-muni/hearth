'use client';

import React, { useState } from 'react';
import { Box, Flex, HStack, VStack, Text } from '@chakra-ui/react';
import { HouseHelp } from '@/types';
import { formatCurrency, formatMonthDisplay } from '@/utils/dateUtils';
import { StaffFormModal } from './StaffFormModal';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Plus, Edit2, Trash2, RotateCcw } from 'lucide-react';

interface ConfigViewProps {
  helpers: HouseHelp[];
  currentMonth?: string;
  onSaveHelper: (helper: HouseHelp) => void;
  onDeleteHelper: (id: string) => void;
  onRestoreHelper?: (id: string) => void;
  onHardDeleteHelper?: (id: string) => void;
}

const WEEKDAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const ConfigView: React.FC<ConfigViewProps> = ({
  helpers,
  currentMonth,
  onSaveHelper,
  onDeleteHelper,
  onRestoreHelper,
  onHardDeleteHelper,
}) => {
  const [editingHelper, setEditingHelper] = useState<HouseHelp | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [helperToRemove, setHelperToRemove] = useState<HouseHelp | null>(null);
  const [helperToHardDelete, setHelperToHardDelete] = useState<HouseHelp | null>(null);

  const activeHelpers = helpers.filter((h) => h.isActive !== false);
  const formerHelpers = helpers.filter((h) => h.isActive === false);

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
      <Flex justify="space-between" align="center" px={1}>
        <Text fontSize="14px" fontWeight="700" color="var(--text-primary)">
          Active Staff ({activeHelpers.length})
        </Text>

        <Button
          variant="primary"
          size="xs"
          onClick={handleOpenAdd}
          icon={<Plus size={13} />}
          aria-label="Add new staff member"
        >
          Add Staff
        </Button>
      </Flex>

      <VStack gap={2} align="stretch">
        {activeHelpers.length === 0 ? (
          <Card style={{ padding: '24px 16px', textAlign: 'center' }}>
            <Text fontSize="13px" fontWeight="600" color="var(--text-primary)" mb={1}>
              No staff members yet
            </Text>
            <Text fontSize="11px" color="var(--text-muted)" mb={3}>
              Click Add Staff above to add your first maid, cook, driver, or helper.
            </Text>
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenAdd}
              icon={<Plus size={13} />}
              style={{ margin: '0 auto' }}
            >
              Add First Staff
            </Button>
          </Card>
        ) : (
          activeHelpers.map((h) => (
            <Card key={h.id} style={{ padding: '12px' }}>
              <Flex justify="space-between" align="center">
                <HStack gap={2.5}>
                  <Text fontSize="22px">{h.avatarEmoji}</Text>
                  <Box>
                    <Text fontSize="13px" fontWeight="700" color="var(--text-primary)">
                      {h.name}
                    </Text>
                    <Text fontSize="11px" color="var(--text-muted)">
                      {h.salaryType === 'DAYS_LEAVES' &&
                        `${h.role} • ${formatCurrency(h.baseSalary)}/mo`}
                      {h.salaryType === 'FIXED' && `${h.role} • ${formatCurrency(h.baseSalary)}/mo`}
                      {h.salaryType === 'COUNT_BASED' &&
                        `${h.role} • ${formatCurrency(h.ratePerItem ?? h.baseSalary)}/${h.itemUnitName || 'item'}`}
                    </Text>
                    <Text fontSize="10px" color="var(--text-subtle)">
                      {h.salaryType === 'DAYS_LEAVES' &&
                        `${h.paidLeavesAllowance} paid leaves/mo • ${h.weeklyOffDay >= 0 ? `${WEEKDAY_NAMES[h.weeklyOffDay]} off` : 'No weekly off'}`}
                      {h.salaryType === 'FIXED' && 'Fixed flat monthly payout'}
                      {h.salaryType === 'COUNT_BASED' && 'Per-item piece rate tracking'}
                    </Text>
                  </Box>
                </HStack>

                <HStack gap={1}>
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => handleOpenEdit(h)}
                    icon={<Edit2 size={12} />}
                    aria-label="Edit staff member"
                    style={{ padding: '5px 7px' }}
                  />
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => setHelperToRemove(h)}
                    icon={<Trash2 size={12} />}
                    aria-label="Remove staff member"
                    style={{ padding: '5px 7px' }}
                  />
                </HStack>
              </Flex>
            </Card>
          ))
        )}
      </VStack>

      {formerHelpers.length > 0 && (
        <VStack gap={2} align="stretch" pt={2}>
          <Text fontSize="12px" fontWeight="600" color="var(--text-muted)" px={1}>
            Former Staff ({formerHelpers.length}) — History Preserved
          </Text>
          {formerHelpers.map((h) => (
            <Card key={h.id} variant="subtle" style={{ padding: '10px 12px', opacity: 0.85 }}>
              <Flex justify="space-between" align="center">
                <HStack gap={2}>
                  <Text fontSize="18px">{h.avatarEmoji}</Text>
                  <Box>
                    <Text fontSize="12px" fontWeight="600" color="var(--text-secondary)">
                      {h.name}
                    </Text>
                    <Text fontSize="10px" color="var(--text-subtle)">
                      {h.role} • Left {h.leftDate ? formatMonthDisplay(h.leftDate) : 'recently'}
                    </Text>
                  </Box>
                </HStack>

                <HStack gap={1}>
                  {onRestoreHelper && (
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => onRestoreHelper(h.id)}
                      icon={<RotateCcw size={11} />}
                    >
                      Restore
                    </Button>
                  )}
                  {onHardDeleteHelper && (
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => setHelperToHardDelete(h)}
                      icon={<Trash2 size={11} color="var(--text-subtle)" />}
                      aria-label="Permanently delete staff member"
                      style={{ padding: '5px 7px' }}
                    />
                  )}
                </HStack>
              </Flex>
            </Card>
          ))}
        </VStack>
      )}

      <StaffFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        helper={editingHelper}
        onSave={onSaveHelper}
        currentMonth={currentMonth}
      />

      <ConfirmDialog
        isOpen={!!helperToRemove}
        onClose={() => setHelperToRemove(null)}
        onConfirm={() => {
          if (helperToRemove) {
            onDeleteHelper(helperToRemove.id);
          }
        }}
        title={`Remove ${helperToRemove?.name || 'Staff Member'}?`}
        description={`Remove ${helperToRemove?.name} from ${currentMonth ? formatMonthDisplay(currentMonth) : 'this month'} onwards? Their previous months' attendance, payments, and salary history will remain completely preserved in past months.`}
        confirmLabel="Remove Staff"
        variant="danger"
      />

      <ConfirmDialog
        isOpen={!!helperToHardDelete}
        onClose={() => setHelperToHardDelete(null)}
        onConfirm={() => {
          if (helperToHardDelete) {
            onHardDeleteHelper?.(helperToHardDelete.id);
          }
        }}
        title={`Permanently Delete ${helperToHardDelete?.name || 'Staff Member'}?`}
        description={`Permanently delete ${helperToHardDelete?.name} and all their historical records? This will completely remove them and their past history from all months. This action cannot be undone.`}
        confirmLabel="Delete Permanently"
        variant="danger"
      />
    </VStack>
  );
};
