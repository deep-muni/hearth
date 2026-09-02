'use client';

import React, { useState } from 'react';
import { Box, Flex, HStack, VStack, Text, SimpleGrid } from '@chakra-ui/react';
import { HouseHelp, SalaryType } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { EMOJI_OPTIONS, PRESET_ROLES, SALARY_TYPES, WEEKDAY_OPTIONS } from '@/constants';
import { normalizeSalaryType } from '@/utils/salaryCalculator';

interface StaffFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  helper: HouseHelp | null;
  onSave: (helper: HouseHelp) => void;
}

const StaffFormDialog: React.FC<StaffFormModalProps> = ({ isOpen, onClose, helper, onSave }) => {
  const [name, setName] = useState(helper?.name || '');
  const [role, setRole] = useState(helper?.role || 'Cook');
  const [emoji, setEmoji] = useState(helper?.avatarEmoji || '👩‍🍳');
  const [salaryType, setSalaryType] = useState<SalaryType>(() =>
    normalizeSalaryType(helper?.salaryType || 'DAYS_LEAVES')
  );
  const [baseSalary, setBaseSalary] = useState<string | number>(helper?.baseSalary ?? 8000);
  const [ratePerItem, setRatePerItem] = useState<string | number>(
    helper?.ratePerItem ?? (helper?.salaryType === 'COUNT_BASED' ? helper.baseSalary : 25)
  );
  const [itemUnitName, setItemUnitName] = useState<string>(helper?.itemUnitName || 'items');
  const [paidLeaves, setPaidLeaves] = useState<string | number>(helper?.paidLeavesAllowance ?? 2);
  const [weeklyOff, setWeeklyOff] = useState<number>(helper?.weeklyOffDay ?? 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter a name');
      return;
    }

    const normalized = normalizeSalaryType(salaryType);

    const helperToSave: HouseHelp = {
      id: helper ? helper.id : `helper_${Date.now()}`,
      name: name.trim(),
      role: role.trim() || 'Staff',
      avatarEmoji: emoji,
      colorTheme: 'pink',
      salaryType: normalized,
      baseSalary:
        normalized === 'COUNT_BASED'
          ? Math.max(0, Number(ratePerItem) || 0)
          : Math.max(0, Number(baseSalary) || 0),
      ratePerItem: normalized === 'COUNT_BASED' ? Math.max(0, Number(ratePerItem) || 0) : undefined,
      itemUnitName: normalized === 'COUNT_BASED' ? itemUnitName.trim() || 'items' : undefined,
      paidLeavesAllowance: normalized === 'DAYS_LEAVES' ? Math.max(0, Number(paidLeaves) || 0) : 0,
      weeklyOffDay: normalized === 'DAYS_LEAVES' ? Number(weeklyOff) : -1,
      phone: helper?.phone || '',
      isActive: true,
      joinDate: helper?.joinDate || new Date().toISOString().split('T')[0],
    };

    onSave(helperToSave);
    onClose();
  };

  const normalized = normalizeSalaryType(salaryType);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={helper ? 'Edit Staff Member' : 'Add Staff Member'}
      description="Configure staff role, salary model, and rates"
      maxWidth="380px"
    >
      <form onSubmit={handleSubmit}>
        <VStack gap={2.5} align="stretch">
          <Input
            label="Name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Sunita"
            required
          />

          <Box>
            <Text fontSize="11px" fontWeight="600" color="#64748b" mb={1}>
              Role
            </Text>
            <Flex gap={1} wrap="wrap" mb={1.5}>
              {PRESET_ROLES.map((r) => (
                <button
                  key={r.role}
                  type="button"
                  onClick={() => {
                    setRole(r.role);
                    setEmoji(r.emoji);
                  }}
                  style={{
                    padding: '2px 7px',
                    borderRadius: '9999px',
                    border: '1px solid',
                    borderColor: role === r.role ? '#0f172a' : '#e2e8f0',
                    background: role === r.role ? '#0f172a' : '#ffffff',
                    color: role === r.role ? '#ffffff' : '#64748b',
                    fontSize: '10px',
                    cursor: 'pointer',
                  }}
                >
                  {r.emoji} {r.role}
                </button>
              ))}
            </Flex>
            <Input
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Custom role description"
            />
          </Box>

          <Box>
            <Text fontSize="11px" fontWeight="600" color="#64748b" mb={1}>
              Avatar Icon
            </Text>
            <Flex gap={1} wrap="wrap">
              {EMOJI_OPTIONS.map((em) => (
                <Box
                  key={em}
                  onClick={() => setEmoji(em)}
                  w="28px"
                  h="28px"
                  borderRadius="md"
                  border="1px solid"
                  borderColor={emoji === em ? '#0f172a' : '#f1f5f9'}
                  bg={emoji === em ? '#f8fafc' : '#ffffff'}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  fontSize="15px"
                  cursor="pointer"
                >
                  {em}
                </Box>
              ))}
            </Flex>
          </Box>

          <Box>
            <Text fontSize="11px" fontWeight="600" color="#64748b" mb={1}>
              Salary Model *
            </Text>
            <SimpleGrid columns={3} gap={1}>
              {SALARY_TYPES.map((s) => (
                <button
                  key={s.type}
                  type="button"
                  onClick={() => setSalaryType(s.type)}
                  style={{
                    padding: '6px 4px',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: normalized === s.type ? '#0f172a' : '#e2e8f0',
                    background: normalized === s.type ? '#0f172a' : '#ffffff',
                    color: normalized === s.type ? '#ffffff' : '#64748b',
                    fontSize: '10px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    textAlign: 'center',
                    lineHeight: '1.2',
                  }}
                >
                  {s.label}
                </button>
              ))}
            </SimpleGrid>

            <Text fontSize="10px" color="#94a3b8" mt={1}>
              {SALARY_TYPES.find((s) => s.type === normalized)?.description}
            </Text>
          </Box>

          {normalized === 'DAYS_LEAVES' && (
            <>
              <SimpleGrid columns={2} gap={1.5}>
                <Input
                  label="Monthly Base (₹) *"
                  type="number"
                  min="0"
                  step="100"
                  value={baseSalary}
                  onChange={(e) => setBaseSalary(e.target.value)}
                  required
                />
                <Input
                  label="Free Leaves / Mo"
                  type="number"
                  min="0"
                  max="31"
                  value={paidLeaves}
                  onChange={(e) => setPaidLeaves(e.target.value)}
                />
              </SimpleGrid>

              <Select
                label="Weekly Off Day"
                value={weeklyOff}
                onChange={(e) => setWeeklyOff(Number(e.target.value))}
              >
                {WEEKDAY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>
            </>
          )}

          {normalized === 'FIXED' && (
            <Box>
              <Input
                label="Fixed Monthly Salary (₹) *"
                type="number"
                min="0"
                step="100"
                value={baseSalary}
                onChange={(e) => setBaseSalary(e.target.value)}
                required
              />
              <Text fontSize="10px" color="#64748b" mt={1}>
                ✓ No calendar attendance or leave deduction needed for this helper.
              </Text>
            </Box>
          )}

          {normalized === 'COUNT_BASED' && (
            <>
              <SimpleGrid columns={2} gap={1.5}>
                <Input
                  label="Rate per Item (₹) *"
                  type="number"
                  min="0"
                  step="any"
                  value={ratePerItem}
                  onChange={(e) => setRatePerItem(e.target.value)}
                  required
                />
                <Input
                  label="Unit Label"
                  value={itemUnitName}
                  onChange={(e) => setItemUnitName(e.target.value)}
                  placeholder="e.g. clothes, items"
                />
              </SimpleGrid>
              <Text fontSize="10px" color="#64748b">
                ✓ Items given will be logged per date on the calendar.
              </Text>
            </>
          )}
        </VStack>

        <HStack justify="flex-end" gap={1.5} mt={4}>
          <Button variant="outline" size="sm" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit">
            Save
          </Button>
        </HStack>
      </form>
    </Modal>
  );
};

export const StaffFormModal: React.FC<StaffFormModalProps> = (props) => {
  if (!props.isOpen) return null;
  return <StaffFormDialog key={props.helper ? props.helper.id : 'new_helper'} {...props} />;
};
