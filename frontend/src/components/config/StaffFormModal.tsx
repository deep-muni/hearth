"use client";

import React, { useState } from 'react';
import { Box, Flex, HStack, VStack, Text, SimpleGrid } from '@chakra-ui/react';
import { HouseHelp, SalaryType } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import {
  EMOJI_OPTIONS,
  PRESET_ROLES,
  SALARY_TYPES,
  WEEKDAY_OPTIONS,
} from '@/constants';

interface StaffFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  helper: HouseHelp | null;
  onSave: (helper: HouseHelp) => void;
}

const StaffFormDialog: React.FC<StaffFormModalProps> = ({
  isOpen,
  onClose,
  helper,
  onSave,
}) => {
  const [name, setName] = useState(helper?.name || '');
  const [role, setRole] = useState(helper?.role || 'Cook');
  const [emoji, setEmoji] = useState(helper?.avatarEmoji || '👩‍🍳');
  const [salaryType, setSalaryType] = useState<SalaryType>(
    helper?.salaryType || 'FIXED_MONTHLY'
  );
  const [baseSalary, setBaseSalary] = useState<number>(helper?.baseSalary ?? 7000);
  const [paidLeaves, setPaidLeaves] = useState<number>(
    helper?.paidLeavesAllowance ?? 2
  );
  const [weeklyOff, setWeeklyOff] = useState<number>(helper?.weeklyOffDay ?? 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter a name');
      return;
    }

    const helperToSave: HouseHelp = {
      id: helper ? helper.id : `helper_${Date.now()}`,
      name: name.trim(),
      role: role.trim() || 'Staff',
      avatarEmoji: emoji,
      colorTheme: 'pink',
      salaryType,
      baseSalary: Math.max(0, Number(baseSalary) || 0),
      paidLeavesAllowance: Math.max(0, Number(paidLeaves) || 0),
      weeklyOffDay: Number(weeklyOff),
      phone: '',
      isActive: true,
      joinDate: helper?.joinDate || new Date().toISOString().split('T')[0],
    };

    onSave(helperToSave);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={helper ? 'Edit Staff Member' : 'Add Staff Member'}
      description="Configure role, pay frequency and weekly off"
      maxWidth="360px"
    >
      <form onSubmit={handleSubmit}>
        <VStack gap={2.5} align="stretch">
          {/* Name */}
          <Input
            label="Name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Sunita"
            required
          />

          {/* Role Presets & Custom Role */}
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

          {/* Emoji Avatar */}
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

          {/* Salary Model */}
          <Box>
            <Text fontSize="11px" fontWeight="600" color="#64748b" mb={1}>
              Salary Frequency
            </Text>
            <SimpleGrid columns={3} gap={1}>
              {SALARY_TYPES.map((s) => (
                <button
                  key={s.type}
                  type="button"
                  onClick={() => setSalaryType(s.type)}
                  style={{
                    padding: '5px',
                    borderRadius: '6px',
                    border: '1px solid',
                    borderColor: salaryType === s.type ? '#0f172a' : '#e2e8f0',
                    background: salaryType === s.type ? '#0f172a' : '#ffffff',
                    color: salaryType === s.type ? '#ffffff' : '#64748b',
                    fontSize: '10px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  {s.label}
                </button>
              ))}
            </SimpleGrid>
          </Box>

          {/* Amount & Free Leaves */}
          <SimpleGrid columns={2} gap={1.5}>
            <Input
              label="Amount (₹) *"
              type="number"
              min="0"
              step="100"
              value={baseSalary}
              onChange={(e) => setBaseSalary(Number(e.target.value))}
              required
            />
            <Input
              label="Free Leaves"
              type="number"
              min="0"
              max="31"
              value={paidLeaves}
              onChange={(e) => setPaidLeaves(Number(e.target.value))}
            />
          </SimpleGrid>

          {/* Weekly Off Day */}
          <Select
            label="Weekly Off"
            value={weeklyOff}
            onChange={(e) => setWeeklyOff(Number(e.target.value))}
          >
            {WEEKDAY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
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
  return (
    <StaffFormDialog
      key={props.helper ? props.helper.id : 'new_helper'}
      {...props}
    />
  );
};
