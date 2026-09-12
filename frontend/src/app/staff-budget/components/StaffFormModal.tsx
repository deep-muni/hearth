'use client';

import React, { useState, useEffect } from 'react';
import { Box, Flex, VStack, Text, SimpleGrid, Button, Input, IconButton } from '@chakra-ui/react';
import { StaffMember, SalaryType } from '../types';
import { ROLE_ICON_LIST, RoleIcon, RoleIconId, resolveRoleIcon } from '@/components/icons';
import { normalizeSalaryType } from '../utils/salaryCalculator';
import { WEEKDAY_OPTIONS, PRESET_ROLES, SALARY_TYPES } from '../constants';
import { HearthModalShell } from './modals/HearthModalShell';
import { CheckMarkIcon } from '@/components/icons';

interface StaffFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff?: StaffMember | null;
  onSave: (staff: StaffMember) => void;
  currentMonth?: string;
}

export const StaffFormModal: React.FC<StaffFormModalProps> = ({
  isOpen,
  onClose,
  staff,
  onSave,
  currentMonth,
}) => {
  const currentStaff = staff;
  const isEditing = !!currentStaff;

  const [name, setName] = useState(currentStaff?.name || '');
  const [roleText, setRoleText] = useState(currentStaff?.role || 'Cook');
  const [iconId, setIconId] = useState<RoleIconId>(
    resolveRoleIcon(currentStaff?.role || 'Cook', currentStaff?.icon)
  );
  const [model, setModel] = useState<SalaryType>(
    normalizeSalaryType(currentStaff?.salaryType || 'DAYS_LEAVES')
  );

  const [baseSalary, setBaseSalary] = useState<string>(
    currentStaff?.baseSalary !== undefined ? String(currentStaff.baseSalary) : '5000'
  );
  const [ratePerItem, setRatePerItem] = useState<string>(
    currentStaff?.ratePerItem !== undefined
      ? String(currentStaff.ratePerItem)
      : currentStaff?.baseSalary !== undefined
        ? String(currentStaff.baseSalary)
        : '8'
  );
  const [unitLabel, setUnitLabel] = useState(currentStaff?.itemUnitName || 'Clothes');
  const [paidLeaves, setPaidLeaves] = useState(
    String(currentStaff?.paidLeavesAllowance !== undefined ? currentStaff.paidLeavesAllowance : 2)
  );
  const [weeklyOff, setWeeklyOff] = useState<number>(
    currentStaff?.weeklyOffDay !== undefined ? currentStaff.weeklyOffDay : -1
  );

  const [nameError, setNameError] = useState('');

  useEffect(() => {
    if (currentStaff) {
      setName(currentStaff.name || '');
      setRoleText(currentStaff.role || 'Cook');
      setIconId(resolveRoleIcon(currentStaff.role || 'Cook', currentStaff.icon));
      setModel(normalizeSalaryType(currentStaff.salaryType || 'DAYS_LEAVES'));
      setBaseSalary(currentStaff.baseSalary !== undefined ? String(currentStaff.baseSalary) : '5000');
      setRatePerItem(
        currentStaff.ratePerItem !== undefined
          ? String(currentStaff.ratePerItem)
          : currentStaff.baseSalary !== undefined
            ? String(currentStaff.baseSalary)
            : '8'
      );
      setUnitLabel(currentStaff.itemUnitName || 'Clothes');
      setPaidLeaves(
        String(currentStaff.paidLeavesAllowance !== undefined ? currentStaff.paidLeavesAllowance : 2)
      );
      setWeeklyOff(currentStaff.weeklyOffDay !== undefined ? currentStaff.weeklyOffDay : -1);
    } else {
      setName('');
      setRoleText('Cook');
      setIconId(resolveRoleIcon('Cook'));
      setModel('DAYS_LEAVES');
      setBaseSalary('5000');
      setRatePerItem('8');
      setUnitLabel('Clothes');
      setPaidLeaves('2');
      setWeeklyOff(-1);
    }
    setNameError('');
  }, [currentStaff, isOpen]);

  const handleRoleSelect = (roleName: string) => {
    setRoleText(roleName);
    const resolved = resolveRoleIcon(roleName);
    setIconId(resolved);
  };

  const handleRoleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setRoleText(val);
    const resolved = resolveRoleIcon(val);
    setIconId(resolved);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setNameError('Name is required');
      return;
    }

    const normalized = normalizeSalaryType(model);

    const staffToSave: StaffMember = {
      ...(currentStaff || {}),
      id: currentStaff?.id || `staff_${Date.now()}`,
      name: name.trim(),
      role: roleText.trim() || 'Cook',
      icon: iconId,
      salaryType: normalized,
      baseSalary: normalized === 'COUNT_BASED' ? 0 : Math.max(0, Number(baseSalary) || 0),
      ratePerItem: normalized === 'COUNT_BASED' ? Math.max(0, Number(ratePerItem) || 0) : undefined,
      itemUnitName: normalized === 'COUNT_BASED' ? unitLabel.trim() || 'clothes' : undefined,
      paidLeavesAllowance: normalized === 'DAYS_LEAVES' ? Math.max(0, Number(paidLeaves) || 0) : 0,
      weeklyOffDay: normalized === 'DAYS_LEAVES' ? Number(weeklyOff) : -1,
      phone: currentStaff?.phone || '',
      notes: currentStaff?.notes || '',
      isActive: true,
      joinDate:
        currentStaff?.joinDate ||
        (currentMonth ? `${currentMonth}-01` : new Date().toISOString().split('T')[0]),
    };

    onSave(staffToSave);
    onClose();
  };

  const activeModelOption = SALARY_TYPES.find((m) => m.type === model) || SALARY_TYPES[0];

  return (
    <HearthModalShell
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit staff member' : 'Add staff member'}
      subtitle="Role, salary model and rates"
      footer={
        <Flex justify="flex-end" gap="9px">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            px="17px"
            py="11px"
            h="auto"
            borderRadius="999px"
            border="1px solid var(--hh-line)"
            bg="var(--hh-cardHover)"
            fontFamily="'Instrument Sans', system-ui, sans-serif"
            fontSize="13.5px"
            fontWeight={600}
            color="var(--hh-ink)"
            _hover={{
              borderColor: 'var(--hh-muted)',
            }}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            px="20px"
            py="11px"
            h="auto"
            borderRadius="999px"
            border="none"
            bg="var(--hh-accent)"
            color="#FFFFFF"
            fontFamily="'Instrument Sans', system-ui, sans-serif"
            fontSize="13.5px"
            fontWeight={600}
            transition="transform 170ms ease, opacity 200ms ease"
            _hover={{
              transform: 'translateY(-1px)',
              opacity: 0.92,
            }}
          >
            Save
          </Button>
        </Flex>
      }
    >
      <Box as="form" onSubmit={handleSubmit} display="flex" flexDirection="column" gap="16px">
        {/* Name Field */}
        <Box>
          <Text
            as="label"
            display="block"
            fontFamily="'Instrument Sans', system-ui, sans-serif"
            fontSize="12px"
            fontWeight={600}
            color="var(--hh-muted)"
            mb="7px"
          >
            Name *
          </Text>
          <Input
            type="text"
            placeholder="e.g. Sunita"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (nameError) setNameError('');
            }}
            w="100%"
            p="12px 13px"
            h="auto"
            borderRadius="13px"
            border="1px solid"
            borderColor={nameError ? '#B4403A' : 'var(--hh-line)'}
            bg="var(--hh-cardHover)"
            fontFamily="'Instrument Sans', system-ui, sans-serif"
            fontSize="14px"
            color="var(--hh-ink)"
            _focus={{
              outline: '2px solid var(--hh-accent)',
              outlineOffset: '1px',
            }}
            required
            autoFocus
          />
          {nameError && (
            <Text
              fontFamily="'Instrument Sans', system-ui, sans-serif"
              fontSize="11.5px"
              color="#B4403A"
              mt="4px"
              m={0}
            >
              {nameError}
            </Text>
          )}
        </Box>

        {/* Role pills and custom role */}
        <Box display="flex" flexDirection="column" gap="9px">
          <Text
            fontFamily="'Instrument Sans', system-ui, sans-serif"
            fontSize="12px"
            fontWeight={600}
            color="var(--hh-muted)"
            m={0}
          >
            Role
          </Text>
          <Flex wrap="wrap" gap="7px">
            {PRESET_ROLES.map((r) => {
              const isActive = roleText.toLowerCase() === r.role.toLowerCase();
              return (
                <Button
                  key={r.role}
                  type="button"
                  variant="ghost"
                  onClick={() => handleRoleSelect(r.role)}
                  px="14px"
                  py="9px"
                  h="auto"
                  borderRadius="999px"
                  border="1px solid"
                  borderColor={isActive ? 'transparent' : 'var(--hh-line)'}
                  bg={isActive ? 'var(--hh-ink)' : 'var(--hh-cardHover)'}
                  color={isActive ? 'var(--hh-paper)' : 'var(--hh-ink)'}
                  fontFamily="'Instrument Sans', system-ui, sans-serif"
                  fontSize="13px"
                  fontWeight={600}
                  transition="background 180ms ease"
                  _hover={{
                    bg: isActive ? 'var(--hh-ink)' : 'var(--hh-card)',
                  }}
                >
                  {r.role}
                </Button>
              );
            })}
          </Flex>
          <Input
            type="text"
            placeholder="Or type a custom role"
            value={roleText}
            onChange={handleRoleTextChange}
            w="100%"
            p="12px 13px"
            h="auto"
            borderRadius="13px"
            border="1px solid var(--hh-line)"
            bg="var(--hh-cardHover)"
            fontFamily="'Instrument Sans', system-ui, sans-serif"
            fontSize="14px"
            color="var(--hh-ink)"
            _focus={{
              outline: '2px solid var(--hh-accent)',
              outlineOffset: '1px',
            }}
          />
        </Box>

        {/* Role Icon Picker */}
        <Box display="flex" flexDirection="column" gap="9px">
          <Text
            fontFamily="'Instrument Sans', system-ui, sans-serif"
            fontSize="12px"
            fontWeight={600}
            color="var(--hh-muted)"
            m={0}
          >
            Icon
          </Text>
          <Flex wrap="wrap" gap="7px">
            {ROLE_ICON_LIST.map((ic) => {
              const isActive = iconId === ic.id;
              return (
                <IconButton
                  key={ic.id}
                  type="button"
                  variant="ghost"
                  onClick={() => setIconId(ic.id)}
                  aria-label={ic.label}
                  w="42px"
                  h="42px"
                  minW="42px"
                  borderRadius="13px"
                  p={0}
                  border="1px solid"
                  borderColor={isActive ? 'var(--hh-accent)' : 'var(--hh-line)'}
                  bg={isActive ? 'var(--hh-accentSoft)' : 'var(--hh-cardHover)'}
                  color={isActive ? 'var(--hh-accentInk)' : 'var(--hh-muted)'}
                  transition="border-color 180ms ease, background 180ms ease, color 180ms ease"
                  _hover={{
                    borderColor: 'var(--hh-accent)',
                    bg: isActive ? 'var(--hh-accentSoft)' : 'var(--hh-card)',
                  }}
                >
                  <RoleIcon name={ic.id} size={20} strokeWidth={1.6} />
                </IconButton>
              );
            })}
          </Flex>
        </Box>

        {/* Salary Model Selection */}
        <Box display="flex" flexDirection="column" gap="9px">
          <Text
            fontFamily="'Instrument Sans', system-ui, sans-serif"
            fontSize="12px"
            fontWeight={600}
            color="var(--hh-muted)"
            m={0}
          >
            Salary model
          </Text>
          <SimpleGrid columns={3} gap="7px">
            {SALARY_TYPES.map((opt) => {
              const isActive = model === opt.type;
              return (
                <Button
                  key={opt.type}
                  type="button"
                  variant="ghost"
                  onClick={() => setModel(opt.type)}
                  px="8px"
                  py="11px"
                  h="auto"
                  borderRadius="13px"
                  border="1px solid"
                  borderColor={isActive ? 'transparent' : 'var(--hh-line)'}
                  bg={isActive ? 'var(--hh-ink)' : 'var(--hh-cardHover)'}
                  color={isActive ? 'var(--hh-paper)' : 'var(--hh-ink)'}
                  fontFamily="'Instrument Sans', system-ui, sans-serif"
                  fontSize="12.5px"
                  fontWeight={600}
                  textAlign="center"
                  whiteSpace="normal"
                  lineHeight="1.2"
                  transition="background 180ms ease"
                  _hover={{
                    bg: isActive ? 'var(--hh-ink)' : 'var(--hh-card)',
                  }}
                >
                  {opt.label}
                </Button>
              );
            })}
          </SimpleGrid>
          <Text
            fontFamily="'Instrument Sans', system-ui, sans-serif"
            fontSize="11.5px"
            lineHeight="1.45"
            color="var(--hh-muted)"
            m={0}
          >
            {activeModelOption.description}
          </Text>
        </Box>

        {/* Conditional Model Inputs */}
        {model === 'DAYS_LEAVES' && (
          <VStack gap="12px" align="stretch">
            <SimpleGrid columns={2} gap="12px">
              <Box>
                <Text
                  as="label"
                  display="block"
                  fontFamily="'Instrument Sans', system-ui, sans-serif"
                  fontSize="12px"
                  fontWeight={600}
                  color="var(--hh-muted)"
                  mb="7px"
                >
                  Monthly base (₹) *
                </Text>
                <Input
                  type="number"
                  min="0"
                  step="100"
                  placeholder="5000"
                  value={baseSalary}
                  onChange={(e) => setBaseSalary(e.target.value)}
                  w="100%"
                  p="12px 13px"
                  h="auto"
                  borderRadius="13px"
                  border="1px solid var(--hh-line)"
                  bg="var(--hh-cardHover)"
                  fontFamily="'Instrument Sans', system-ui, sans-serif"
                  fontSize="14px"
                  fontWeight={600}
                  color="var(--hh-ink)"
                  _focus={{
                    outline: '2px solid var(--hh-accent)',
                    outlineOffset: '1px',
                  }}
                  required
                />
              </Box>
              <Box>
                <Text
                  as="label"
                  display="block"
                  fontFamily="'Instrument Sans', system-ui, sans-serif"
                  fontSize="12px"
                  fontWeight={600}
                  color="var(--hh-muted)"
                  mb="7px"
                >
                  Free leaves / mo
                </Text>
                <Input
                  type="number"
                  min="0"
                  max="31"
                  placeholder="2"
                  value={paidLeaves}
                  onChange={(e) => setPaidLeaves(e.target.value)}
                  w="100%"
                  p="12px 13px"
                  h="auto"
                  borderRadius="13px"
                  border="1px solid var(--hh-line)"
                  bg="var(--hh-cardHover)"
                  fontFamily="'Instrument Sans', system-ui, sans-serif"
                  fontSize="14px"
                  fontWeight={600}
                  color="var(--hh-ink)"
                  _focus={{
                    outline: '2px solid var(--hh-accent)',
                    outlineOffset: '1px',
                  }}
                />
              </Box>
            </SimpleGrid>

            <Box>
              <Text
                as="label"
                display="block"
                fontFamily="'Instrument Sans', system-ui, sans-serif"
                fontSize="12px"
                fontWeight={600}
                color="var(--hh-muted)"
                mb="7px"
              >
                Weekly off
              </Text>
              <select
                value={weeklyOff}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setWeeklyOff(Number(e.target.value))
                }
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '12px 13px',
                  borderRadius: '13px',
                  border: '1px solid var(--hh-line)',
                  background: 'var(--hh-cardHover)',
                  fontFamily: "'Instrument Sans', system-ui, sans-serif",
                  fontSize: '14px',
                  color: 'var(--hh-ink)',
                  outline: 'none',
                }}
              >
                {WEEKDAY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </Box>
          </VStack>
        )}

        {model === 'FIXED' && (
          <VStack gap="10px" align="stretch">
            <Box>
              <Text
                as="label"
                display="block"
                fontFamily="'Instrument Sans', system-ui, sans-serif"
                fontSize="12px"
                fontWeight={600}
                color="var(--hh-muted)"
                mb="7px"
              >
                Fixed monthly salary (₹) *
              </Text>
              <Input
                type="number"
                min="0"
                step="100"
                placeholder="500"
                value={baseSalary}
                onChange={(e) => setBaseSalary(e.target.value)}
                w="100%"
                p="12px 13px"
                h="auto"
                borderRadius="13px"
                border="1px solid var(--hh-line)"
                bg="var(--hh-cardHover)"
                fontFamily="'Instrument Sans', system-ui, sans-serif"
                fontSize="14px"
                fontWeight={600}
                color="var(--hh-ink)"
                _focus={{
                  outline: '2px solid var(--hh-accent)',
                  outlineOffset: '1px',
                }}
                required
              />
            </Box>

            <Flex align="flex-start" gap="7px">
              <Box color="#3F7A57" flex="none" mt="2px">
                <CheckMarkIcon size={14} strokeWidth={2.2} />
              </Box>
              <Text
                fontFamily="'Instrument Sans', system-ui, sans-serif"
                fontSize="12px"
                lineHeight="1.5"
                color="#3F7A57"
                m={0}
              >
                No calendar attendance or leave deduction is tracked for this staff member.
              </Text>
            </Flex>
          </VStack>
        )}

        {model === 'COUNT_BASED' && (
          <VStack gap="10px" align="stretch">
            <SimpleGrid columns={2} gap="12px">
              <Box>
                <Text
                  as="label"
                  display="block"
                  fontFamily="'Instrument Sans', system-ui, sans-serif"
                  fontSize="12px"
                  fontWeight={600}
                  color="var(--hh-muted)"
                  mb="7px"
                >
                  Rate per item (₹) *
                </Text>
                <Input
                  type="number"
                  min="0"
                  step="any"
                  placeholder="8"
                  value={ratePerItem}
                  onChange={(e) => setRatePerItem(e.target.value)}
                  w="100%"
                  p="12px 13px"
                  h="auto"
                  borderRadius="13px"
                  border="1px solid var(--hh-line)"
                  bg="var(--hh-cardHover)"
                  fontFamily="'Instrument Sans', system-ui, sans-serif"
                  fontSize="14px"
                  fontWeight={600}
                  color="var(--hh-ink)"
                  _focus={{
                    outline: '2px solid var(--hh-accent)',
                    outlineOffset: '1px',
                  }}
                  required
                />
              </Box>
              <Box>
                <Text
                  as="label"
                  display="block"
                  fontFamily="'Instrument Sans', system-ui, sans-serif"
                  fontSize="12px"
                  fontWeight={600}
                  color="var(--hh-muted)"
                  mb="7px"
                >
                  Unit label
                </Text>
                <Input
                  type="text"
                  placeholder="Clothes"
                  value={unitLabel}
                  onChange={(e) => setUnitLabel(e.target.value)}
                  w="100%"
                  p="12px 13px"
                  h="auto"
                  borderRadius="13px"
                  border="1px solid var(--hh-line)"
                  bg="var(--hh-cardHover)"
                  fontFamily="'Instrument Sans', system-ui, sans-serif"
                  fontSize="14px"
                  color="var(--hh-ink)"
                  _focus={{
                    outline: '2px solid var(--hh-accent)',
                    outlineOffset: '1px',
                  }}
                />
              </Box>
            </SimpleGrid>

            <Flex align="flex-start" gap="7px">
              <Box color="#3F7A57" flex="none" mt="2px">
                <CheckMarkIcon size={14} strokeWidth={2.2} />
              </Box>
              <Text
                fontFamily="'Instrument Sans', system-ui, sans-serif"
                fontSize="12px"
                lineHeight="1.5"
                color="#3F7A57"
                m={0}
              >
                Items given will be logged per date on the calendar.
              </Text>
            </Flex>
          </VStack>
        )}
      </Box>
    </HearthModalShell>
  );
};
