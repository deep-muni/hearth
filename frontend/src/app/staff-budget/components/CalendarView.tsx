'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Box, Flex, VStack, Text, Button, SimpleGrid } from '@chakra-ui/react';
import {
  AttendanceRecord,
  AttendanceStatus,
  StaffSalaryCalculation,
  StaffMember,
} from '../types';
import { buildCalendarDays, CalendarDayInfo, formatCurrency } from '@/utils/dateUtils';
import { CalendarGrid } from './CalendarGrid';
import { DayDetailModal } from './DayDetailModal';
import { ItemCountModal } from './ItemCountModal';
import { RoleIcon, CalendarOffIcon, PlusIcon } from '@/components/icons';
import { normalizeSalaryType } from '../utils/salaryCalculator';

interface CalendarViewProps {
  currentMonth: string;
  staff: StaffMember[];
  selectedStaffId?: string;
  onSelectStaff: (id: string) => void;
  attendance: AttendanceRecord[];
  onSetAttendance: (
    staffId: string,
    dateStr: string,
    status: AttendanceStatus,
    note?: string
  ) => void;
  onSetItemCount?: (
    staffId: string,
    dateStr: string,
    count: number,
    note?: string,
    customRate?: number
  ) => void;
  onRemoveAttendance: (staffId: string, dateStr: string) => void;
  salaryCalculation?: StaffSalaryCalculation;
  onNavigateToConfig?: () => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  currentMonth,
  staff,
  selectedStaffId,
  onSelectStaff,
  attendance,
  onSetAttendance,
  onSetItemCount,
  onRemoveAttendance,
  salaryCalculation,
  onNavigateToConfig,
}) => {
  const [modalDate, setModalDate] = useState<string | null>(null);

  const selectedStaff = useMemo(() => {
    if (!staff.length) return null;
    if (selectedStaffId) {
      const found = staff.find((h) => h.id === selectedStaffId);
      if (found) return found;
    }
    return staff[0];
  }, [staff, selectedStaffId]);

  const calendarDays = useMemo(() => buildCalendarDays(currentMonth), [currentMonth]);

  const recordsByDate = useMemo(() => {
    const map = new Map<string, AttendanceRecord>();
    if (!selectedStaff) return map;

    attendance
      .filter((r) => r.staffId === selectedStaff.id && r.date.startsWith(currentMonth))
      .forEach((r) => map.set(r.date, r));

    return map;
  }, [attendance, selectedStaff, currentMonth]);

  const handleCellClick = useCallback((dayInfo: CalendarDayInfo) => {
    if (!dayInfo.isCurrentMonth) return;
    setModalDate(dayInfo.dateStr);
  }, []);

  const currentRecord = modalDate ? recordsByDate.get(modalDate) : undefined;

  const normalizedType = selectedStaff
    ? normalizeSalaryType(selectedStaff.salaryType)
    : 'DAYS_LEAVES';
  const ratePerItem = selectedStaff
    ? (selectedStaff.ratePerItem ?? selectedStaff.baseSalary)
    : 0;
  const unitLabel = selectedStaff?.itemUnitName || 'clothes';

  const rateLine = useMemo(() => {
    if (!selectedStaff) return '';
    if (normalizedType === 'DAYS_LEAVES') {
      return `${formatCurrency(selectedStaff.baseSalary)}/mo · ${selectedStaff.paidLeavesAllowance} paid leaves`;
    }
    if (normalizedType === 'FIXED') {
      return `${formatCurrency(selectedStaff.baseSalary)}/mo · fixed, no calendar`;
    }
    const totalItems = salaryCalculation?.totalItemCount ?? 0;
    return `${formatCurrency(ratePerItem)} / ${unitLabel} · ${totalItems} given this month`;
  }, [normalizedType, selectedStaff, ratePerItem, unitLabel, salaryCalculation]);

  if (!selectedStaff) {
    return (
      <Box
        p="36px 20px"
        borderRadius="20px"
        bg="var(--hh-card)"
        border="1px solid var(--hh-line)"
        textAlign="center"
        animation="hubFade 320ms ease both"
      >
        <Text
          fontFamily="'Instrument Serif', Georgia, serif"
          fontSize="24px"
          color="var(--hh-ink)"
          mb="8px"
        >
          No staff configured yet
        </Text>
        <Text
          fontFamily="'Instrument Sans', system-ui, sans-serif"
          fontSize="13.5px"
          color="var(--hh-muted)"
          mb="20px"
        >
          Add your household staff to start tracking attendance and salaries.
        </Text>
        {onNavigateToConfig && (
          <Button
            type="button"
            onClick={onNavigateToConfig}
            px="18px"
            py="10px"
            h="auto"
            borderRadius="999px"
            border="none"
            bg="var(--hh-ink)"
            color="var(--hh-paper)"
            fontFamily="'Instrument Sans', system-ui, sans-serif"
            fontSize="13px"
            fontWeight={600}
            _hover={{
              transform: 'translateY(-1px)',
              opacity: 0.9,
            }}
          >
            <PlusIcon size={14} strokeWidth={2} style={{ marginRight: '6px' }} />
            Add first staff member
          </Button>
        )}
      </Box>
    );
  }

  return (
    <VStack gap="14px" align="stretch" w="100%" animation="hubFade 320ms ease both">
      {/* Staff chips: 3-column equal-width grid */}
      <SimpleGrid columns={3} gap="8px" w="100%">
        {staff.map((s) => {
          const isSelected = s.id === selectedStaff.id;
          const sType = normalizeSalaryType(s.salaryType);

          const staffRecords = attendance.filter(
            (r) => r.staffId === s.id && r.date.startsWith(currentMonth)
          );

          const itemsTotal = staffRecords.reduce((acc, curr) => acc + (curr.itemCount || 0), 0);
          const leavesTotal = staffRecords.reduce((acc, curr) => {
            if (curr.status === 'FULL_LEAVE') return acc + 1;
            if (curr.status === 'HALF_LEAVE') return acc + 0.5;
            return acc;
          }, 0);

          let tagText = '';
          if (sType === 'FIXED') {
            tagText = 'Fixed';
          } else if (sType === 'COUNT_BASED') {
            tagText = itemsTotal > 0 ? String(itemsTotal) : '';
          } else if (sType === 'DAYS_LEAVES' && leavesTotal > 0) {
            tagText = `${leavesTotal}L`;
          }

          return (
            <Button
              key={s.id}
              type="button"
              variant="ghost"
              onClick={() => onSelectStaff(s.id)}
              display="flex"
              alignItems="center"
              justifyContent="flex-start"
              w="100%"
              minW="0"
              gap="7px"
              p="7px 10px 7px 7px"
              h="auto"
              minH="42px"
              borderRadius="999px"
              border="1px solid"
              borderColor={isSelected ? 'transparent' : 'var(--hh-line)'}
              bg={isSelected ? 'var(--hh-ink)' : 'var(--hh-card)'}
              color={isSelected ? 'var(--hh-paper)' : 'var(--hh-ink)'}
              fontFamily="'Instrument Sans', system-ui, sans-serif"
              fontSize="13px"
              fontWeight={600}
              letterSpacing="-0.01em"
              transition="transform 160ms ease, background 200ms ease, border-color 200ms ease"
              _hover={{
                transform: 'translateY(-1px)',
                borderColor: isSelected ? 'transparent' : 'var(--hh-muted)',
              }}
            >
              <Box
                as="span"
                display="flex"
                alignItems="center"
                justifyContent="center"
                flex="none"
                w="26px"
                h="26px"
                borderRadius="50%"
                bg={isSelected ? 'var(--hh-accent)' : 'var(--hh-accentSoft)'}
                color={isSelected ? '#FFFFFF' : 'var(--hh-accentInk)'}
              >
                <RoleIcon name={s.icon || s.role} size={15} strokeWidth={1.6} />
              </Box>
              <Text
                as="span"
                flex="1"
                minW="0"
                overflow="hidden"
                textOverflow="ellipsis"
                whiteSpace="nowrap"
                textAlign="left"
                m={0}
              >
                {s.name}
              </Text>
              {tagText && (
                <Box
                  as="span"
                  display="inline-flex"
                  alignItems="center"
                  justifyContent="center"
                  flex="none"
                  px="6px"
                  py="1px"
                  borderRadius="999px"
                  fontFamily="'Instrument Sans', system-ui, sans-serif"
                  fontSize="10.5px"
                  fontWeight={600}
                  bg={isSelected ? 'rgba(255, 255, 255, 0.16)' : 'var(--hh-sunken)'}
                  color={isSelected ? 'var(--hh-paper)' : 'var(--hh-muted)'}
                >
                  {tagText}
                </Box>
              )}
            </Button>
          );
        })}
      </SimpleGrid>

      {/* Selected staff strip */}
      <Flex
        align="flex-start"
        justify="space-between"
        gap="14px"
        p="16px 18px"
        borderRadius="18px"
        bg="var(--hh-card)"
        border="1px solid var(--hh-line)"
        boxShadow="0 1px 2px rgba(28, 26, 23, 0.03)"
      >
        <Box minW="0">
          <Flex align="baseline" gap="8px" wrap="wrap">
            <Text
              fontFamily="'Instrument Sans', system-ui, sans-serif"
              fontSize="16.5px"
              fontWeight={600}
              letterSpacing="-0.015em"
              color="var(--hh-ink)"
              m={0}
            >
              {selectedStaff.name}
            </Text>
            <Text
              fontFamily="'Instrument Sans', system-ui, sans-serif"
              fontSize="13px"
              color="var(--hh-muted)"
              m={0}
            >
              {selectedStaff.role}
            </Text>
          </Flex>
          <Text
            fontFamily="'Instrument Sans', system-ui, sans-serif"
            fontSize="13px"
            lineHeight="1.5"
            color="var(--hh-muted)"
            mt="4px"
            m={0}
          >
            {rateLine}
          </Text>
        </Box>
        <Text
          flex="none"
          fontFamily="'Instrument Serif', Georgia, serif"
          fontSize="25px"
          lineHeight="1"
          color="var(--hh-ink)"
          m={0}
        >
          {formatCurrency(salaryCalculation?.netPayable ?? selectedStaff.baseSalary)}
        </Text>
      </Flex>

      {/* Calendar or Fixed salary state */}
      {normalizedType === 'FIXED' ? (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          gap="12px"
          p="34px 22px 26px"
          borderRadius="20px"
          bg="var(--hh-card)"
          border="1px solid var(--hh-line)"
          textAlign="center"
        >
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            w="52px"
            h="52px"
            borderRadius="16px"
            bg="var(--hh-accentSoft)"
            color="var(--hh-accentInk)"
          >
            <CalendarOffIcon size={24} strokeWidth={1.7} />
          </Box>

          <Text
            fontFamily="'Instrument Serif', Georgia, serif"
            fontSize="24px"
            lineHeight="1.15"
            color="var(--hh-ink)"
            m={0}
          >
            Fixed salary — no calendar
          </Text>

          <Text
            fontFamily="'Instrument Sans', system-ui, sans-serif"
            fontSize="13.5px"
            lineHeight="1.55"
            color="var(--hh-muted)"
            maxW="34ch"
            m={0}
          >
            {selectedStaff.name} is paid a flat{' '}
            <strong style={{ color: 'var(--hh-ink)' }}>
              {formatCurrency(selectedStaff.baseSalary)}
            </strong>{' '}
            every month. Daily attendance and leave deductions aren&apos;t tracked here.
          </Text>
        </Box>
      ) : (
        <CalendarGrid
          calendarDays={calendarDays}
          recordsByDate={recordsByDate}
          staff={selectedStaff}
          onCellClick={handleCellClick}
        />
      )}

      {/* Modal Dialogs */}
      {modalDate && normalizedType === 'DAYS_LEAVES' && (
        <DayDetailModal
          key={modalDate}
          isOpen={!!modalDate}
          onClose={() => setModalDate(null)}
          staff={selectedStaff}
          dateStr={modalDate}
          currentRecord={currentRecord}
          onSave={(status, note) => {
            onSetAttendance(selectedStaff.id, modalDate, status, note);
          }}
          onRemove={() => {
            onRemoveAttendance(selectedStaff.id, modalDate);
          }}
        />
      )}

      {modalDate && normalizedType === 'COUNT_BASED' && (
        <ItemCountModal
          key={modalDate}
          isOpen={!!modalDate}
          onClose={() => setModalDate(null)}
          staff={selectedStaff}
          dateStr={modalDate}
          currentRecord={currentRecord}
          onSave={(count, note, customRate) => {
            if (onSetItemCount) {
              onSetItemCount(selectedStaff.id, modalDate, count, note, customRate);
            } else {
              onSetAttendance(selectedStaff.id, modalDate, 'PRESENT', note);
            }
          }}
          onRemove={() => {
            onRemoveAttendance(selectedStaff.id, modalDate);
          }}
        />
      )}
    </VStack>
  );
};
