'use client';

import React, { useState } from 'react';
import { Box, Flex, HStack, VStack, Text, Button, IconButton } from '@chakra-ui/react';
import { StaffMember } from '../types';
import { StaffFormModal } from './StaffFormModal';
import { RemoveStaffModal } from './RemoveStaffModal';
import { formatCurrency } from '@/utils/dateUtils';
import { PlusIcon, EditPencilIcon, TrashIcon, RoleIcon } from '@/components/icons';
import { normalizeSalaryType } from '../utils/salaryCalculator';
import { RotateCcw } from 'lucide-react';

interface ConfigViewProps {
  staff: StaffMember[];
  currentMonth?: string;
  onSaveStaff: (staff: StaffMember) => void;
  onDeleteStaff: (id: string) => void;
  onRestoreStaff: (id: string) => void;
  onHardDeleteStaff: (id: string) => void;
}

const WEEKDAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const ConfigView: React.FC<ConfigViewProps> = ({
  staff,
  currentMonth,
  onSaveStaff,
  onDeleteStaff,
  onRestoreStaff,
  onHardDeleteStaff,
}) => {
  const handleSave = onSaveStaff;
  const handleDelete = onDeleteStaff;
  const handleRestore = onRestoreStaff;
  const handleHardDelete = onHardDeleteStaff;

  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [staffToRemove, setStaffToRemove] = useState<StaffMember | null>(null);
  const [staffToHardDelete, setStaffToHardDelete] = useState<StaffMember | null>(null);

  const activeStaff = staff.filter((h) => h.isActive !== false);
  const formerStaff = staff.filter((h) => h.isActive === false);

  const handleOpenAdd = () => {
    setEditingStaff(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (h: StaffMember) => {
    setEditingStaff(h);
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setEditingStaff(null);
  };

  return (
    <VStack gap="14px" align="stretch" w="100%" animation="hubFade 320ms ease both">
      {/* Header Row */}
      <Flex align="center" justify="space-between" gap="12px" px="2px" pt="2px">
        <Text
          fontFamily="'Instrument Serif', Georgia, serif"
          fontSize="23px"
          lineHeight="1.1"
          color="var(--hh-ink)"
          m={0}
        >
          Active staff{' '}
          <Text as="span" color="var(--hh-muted)">
            {activeStaff.length}
          </Text>
        </Text>

        <Button
          type="button"
          onClick={handleOpenAdd}
          display="inline-flex"
          alignItems="center"
          gap="7px"
          px="15px"
          py="10px"
          h="auto"
          borderRadius="999px"
          border="none"
          bg="var(--hh-ink)"
          color="var(--hh-paper)"
          fontFamily="'Instrument Sans', system-ui, sans-serif"
          fontSize="13px"
          fontWeight={600}
          transition="transform 170ms ease, opacity 200ms ease"
          _hover={{
            transform: 'translateY(-1px)',
            opacity: 0.9,
          }}
          aria-label="Add staff member"
        >
          <PlusIcon size={14} strokeWidth={2.1} />
          Add staff
        </Button>
      </Flex>

      {/* Roster List */}
      <VStack gap="12px" align="stretch">
        {activeStaff.length === 0 ? (
          <Box
            p="32px 18px"
            borderRadius="20px"
            bg="var(--hh-card)"
            border="1px solid var(--hh-line)"
            textAlign="center"
          >
            <Text
              fontFamily="'Instrument Serif', Georgia, serif"
              fontSize="22px"
              color="var(--hh-ink)"
              mb="6px"
            >
              No active staff
            </Text>
            <Text
              fontFamily="'Instrument Sans', system-ui, sans-serif"
              fontSize="13px"
              color="var(--hh-muted)"
              mb="16px"
            >
              Tap &quot;Add staff&quot; above to configure your household help.
            </Text>
            <Button
              type="button"
              variant="outline"
              onClick={handleOpenAdd}
              px="18px"
              py="10px"
              h="auto"
              borderRadius="999px"
              border="1px solid var(--hh-line)"
              bg="var(--hh-cardHover)"
              fontFamily="'Instrument Sans', system-ui, sans-serif"
              fontSize="13px"
              fontWeight={600}
              color="var(--hh-ink)"
              _hover={{
                borderColor: 'var(--hh-accent)',
              }}
            >
              <PlusIcon size={14} strokeWidth={2} style={{ marginRight: '6px' }} />
              Add staff member
            </Button>
          </Box>
        ) : (
          activeStaff.map((h) => {
            const normalized = normalizeSalaryType(h.salaryType);

            let payLine = '';
            let noteLine = '';

            if (normalized === 'COUNT_BASED') {
              payLine = `${h.role} · ${formatCurrency(h.ratePerItem ?? h.baseSalary)}/${h.itemUnitName || 'clothes'}`;
              noteLine = 'Per-item piece rate';
            } else if (normalized === 'FIXED') {
              payLine = `${h.role} · ${formatCurrency(h.baseSalary)}/mo`;
              noteLine = 'Fixed flat monthly payout';
            } else {
              payLine = `${h.role} · ${formatCurrency(h.baseSalary)}/mo`;
              const leaves = `${h.paidLeavesAllowance} paid leaves/mo`;
              const off =
                h.weeklyOffDay >= 0 ? `${WEEKDAY_NAMES[h.weeklyOffDay]} off` : 'no weekly off';
              noteLine = `${leaves} · ${off}`;
            }

            return (
              <Box
                key={h.id}
                display="grid"
                gridTemplateColumns="44px minmax(0, 1fr) auto"
                alignItems="center"
                gap="14px"
                p="15px 16px"
                borderRadius="18px"
                bg="var(--hh-card)"
                border="1px solid var(--hh-line)"
                boxShadow="0 1px 2px rgba(28, 26, 23, 0.03)"
                transition="border-color 200ms ease"
                _hover={{
                  borderColor: 'var(--hh-accent)',
                }}
              >
                {/* 44px role icon circle */}
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  w="44px"
                  h="44px"
                  borderRadius="50%"
                  bg="var(--hh-accentSoft)"
                  color="var(--hh-accentInk)"
                >
                  <RoleIcon name={h.icon || h.role} size={21} strokeWidth={1.6} />
                </Box>

                {/* Middle Info */}
                <Box minW="0">
                  <Text
                    fontFamily="'Instrument Sans', system-ui, sans-serif"
                    fontSize="15.5px"
                    fontWeight={600}
                    letterSpacing="-0.01em"
                    color="var(--hh-ink)"
                    m={0}
                  >
                    {h.name}
                  </Text>
                  <Text
                    fontFamily="'Instrument Sans', system-ui, sans-serif"
                    fontSize="12.5px"
                    color="var(--hh-muted)"
                    m={0}
                    mt="2px"
                  >
                    {payLine}
                  </Text>
                  <Text
                    fontFamily="'Instrument Sans', system-ui, sans-serif"
                    fontSize="11.5px"
                    color="var(--hh-muted)"
                    m={0}
                    mt="1px"
                  >
                    {noteLine}
                  </Text>
                </Box>

                {/* Actions */}
                <HStack gap="4px" align="center">
                  <IconButton
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenEdit(h);
                    }}
                    aria-label={`Edit ${h.name}`}
                    variant="ghost"
                    w="34px"
                    h="34px"
                    minW="34px"
                    borderRadius="10px"
                    p={0}
                    color="var(--hh-muted)"
                    transition="background 180ms ease, color 180ms ease"
                    _hover={{
                      bg: 'var(--hh-sunken)',
                      color: 'var(--hh-ink)',
                    }}
                  >
                    <EditPencilIcon size={15} strokeWidth={1.8} />
                  </IconButton>

                  <IconButton
                    type="button"
                    onClick={() => setStaffToRemove(h)}
                    aria-label={`Remove ${h.name}`}
                    variant="ghost"
                    w="34px"
                    h="34px"
                    minW="34px"
                    borderRadius="10px"
                    p={0}
                    color="var(--hh-muted)"
                    transition="background 180ms ease, color 180ms ease"
                    _hover={{
                      bg: 'var(--hh-sunken)',
                      color: '#B4403A',
                    }}
                  >
                    <TrashIcon size={15} strokeWidth={1.8} />
                  </IconButton>
                </HStack>
              </Box>
            );
          })
        )}
      </VStack>

      {/* Former Staff (History Preserved) */}
      {formerStaff.length > 0 && (
        <VStack gap="10px" align="stretch" pt="12px">
          <Text
            fontFamily="'Instrument Sans', system-ui, sans-serif"
            fontSize="12px"
            fontWeight={600}
            color="var(--hh-muted)"
            px="4px"
            m={0}
          >
            Former staff ({formerStaff.length}) — history preserved
          </Text>

          {formerStaff.map((h) => (
            <Box
              key={h.id}
              display="grid"
              gridTemplateColumns="44px minmax(0, 1fr) auto"
              alignItems="center"
              gap="14px"
              p="12px 16px"
              borderRadius="16px"
              bg="var(--hh-card)"
              border="1px dashed var(--hh-line)"
              opacity={0.8}
            >
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                w="44px"
                h="44px"
                borderRadius="50%"
                bg="var(--hh-sunken)"
                color="var(--hh-muted)"
              >
                <RoleIcon name={h.icon || h.role} size={20} strokeWidth={1.6} />
              </Box>

              <Box minW="0">
                <Text
                  fontFamily="'Instrument Sans', system-ui, sans-serif"
                  fontSize="14.5px"
                  fontWeight={600}
                  color="var(--hh-muted)"
                  m={0}
                >
                  {h.name} ({h.role})
                </Text>
                <Text
                  fontFamily="'Instrument Sans', system-ui, sans-serif"
                  fontSize="11.5px"
                  color="var(--hh-muted)"
                  m={0}
                >
                  Inactive
                </Text>
              </Box>

              <HStack gap="4px">
                <IconButton
                  type="button"
                  onClick={() => handleRestore(h.id)}
                  aria-label={`Restore ${h.name}`}
                  variant="ghost"
                  w="34px"
                  h="34px"
                  minW="34px"
                  borderRadius="10px"
                  p={0}
                  color="var(--hh-muted)"
                  _hover={{
                    bg: 'var(--hh-sunken)',
                    color: 'var(--hh-ink)',
                  }}
                >
                  <RotateCcw size={14} />
                </IconButton>
                <IconButton
                  type="button"
                  onClick={() => setStaffToHardDelete(h)}
                  aria-label={`Permanently delete ${h.name}`}
                  variant="ghost"
                  w="34px"
                  h="34px"
                  minW="34px"
                  borderRadius="10px"
                  p={0}
                  color="var(--hh-muted)"
                  _hover={{
                    bg: 'var(--hh-sunken)',
                    color: '#B4403A',
                  }}
                >
                  <TrashIcon size={14} />
                </IconButton>
              </HStack>
            </Box>
          ))}
        </VStack>
      )}

      {/* Staff Form Modal */}
      {isFormModalOpen && (
        <StaffFormModal
          key={editingStaff?.id || 'new'}
          isOpen={isFormModalOpen}
          onClose={handleCloseFormModal}
          staff={editingStaff}
          onSave={handleSave}
          currentMonth={currentMonth}
        />
      )}

      {/* Remove Confirmation */}
      {staffToRemove && (
        <RemoveStaffModal
          isOpen={!!staffToRemove}
          onClose={() => setStaffToRemove(null)}
          onConfirm={() => {
            if (staffToRemove) handleDelete(staffToRemove.id);
          }}
          staff={staffToRemove}
          isPermanent={false}
          currentMonth={currentMonth}
        />
      )}

      {/* Permanent Delete Confirmation */}
      {staffToHardDelete && (
        <RemoveStaffModal
          isOpen={!!staffToHardDelete}
          onClose={() => setStaffToHardDelete(null)}
          onConfirm={() => {
            if (staffToHardDelete && handleHardDelete) {
              handleHardDelete(staffToHardDelete.id);
            }
          }}
          staff={staffToHardDelete}
          isPermanent={true}
          currentMonth={currentMonth}
        />
      )}
    </VStack>
  );
};
