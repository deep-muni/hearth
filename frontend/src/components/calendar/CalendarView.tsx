'use client';

import React, { useState } from 'react';
import { Box, Flex, HStack, VStack, Text, SimpleGrid } from '@chakra-ui/react';
import { AttendanceRecord, AttendanceStatus, HelperSalaryCalculation, HouseHelp } from '@/types';
import { buildCalendarDays, CalendarDayInfo, formatCurrency } from '@/utils/dateUtils';
import { normalizeSalaryType } from '@/utils/salaryCalculator';
import { CalendarGrid } from './CalendarGrid';
import { DayDetailModal } from './DayDetailModal';
import { ItemCountModal } from './ItemCountModal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { CalendarOff, ArrowRight } from 'lucide-react';

interface CalendarViewProps {
  helpers: HouseHelp[];
  selectedHelperId: string;
  onSelectHelper: (id: string) => void;
  currentMonth: string;
  attendance: AttendanceRecord[];
  onSetAttendance: (
    helperId: string,
    date: string,
    status: AttendanceStatus,
    note?: string
  ) => void;
  onSetItemCount?: (
    helperId: string,
    date: string,
    count: number,
    note?: string,
    customRate?: number
  ) => void;
  onRemoveAttendance: (helperId: string, date: string) => void;
  salaryCalculation?: HelperSalaryCalculation;
  onNavigateToSummary?: () => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  helpers,
  selectedHelperId,
  onSelectHelper,
  currentMonth,
  attendance,
  onSetAttendance,
  onSetItemCount,
  onRemoveAttendance,
  salaryCalculation,
  onNavigateToSummary,
}) => {
  const selectedHelper = helpers.find((h) => h.id === selectedHelperId) || helpers[0];
  const [modalDate, setModalDate] = useState<string | null>(null);

  if (!selectedHelper) {
    return (
      <Box p={8} textAlign="center">
        <Text fontSize="13px" color="var(--text-subtle)">
          No staff members found. Add one in the Staff tab.
        </Text>
      </Box>
    );
  }

  const normalizedType = normalizeSalaryType(selectedHelper.salaryType);
  const calendarDays = buildCalendarDays(currentMonth);

  const recordsByDate = new Map<string, AttendanceRecord>();
  attendance
    .filter((a) => a.helperId === selectedHelper.id && a.date.startsWith(currentMonth))
    .forEach((r) => recordsByDate.set(r.date, r));

  const handleCellClick = (dayInfo: CalendarDayInfo) => {
    if (!dayInfo.isCurrentMonth) return;
    setModalDate(dayInfo.dateStr);
  };

  const currentRecord = modalDate ? recordsByDate.get(modalDate) : undefined;
  const ratePerItem = selectedHelper.ratePerItem ?? selectedHelper.baseSalary;
  const unitLabel = selectedHelper.itemUnitName || 'items';

  return (
    <VStack gap={3} align="stretch" w="100%">
      <SimpleGrid
        columns={helpers.length <= 3 ? helpers.length : helpers.length === 4 ? 2 : 3}
        gap={1.5}
      >
        {helpers.map((h) => {
          const isSelected = h.id === selectedHelper.id;
          const hType = normalizeSalaryType(h.salaryType);

          const helperRecords = attendance.filter(
            (a) => a.helperId === h.id && a.date.startsWith(currentMonth)
          );

          const leaves = helperRecords.reduce((acc, curr) => {
            if (curr.status === 'FULL_LEAVE') return acc + 1;
            if (curr.status === 'HALF_LEAVE') return acc + 0.5;
            return acc;
          }, 0);

          const itemsTotal = helperRecords.reduce((acc, curr) => {
            return acc + (curr.itemCount || 0);
          }, 0);

          return (
            <button
              key={h.id}
              onClick={() => onSelectHelper(h.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px',
                padding: '7px 6px',
                borderRadius: '10px',
                border: '1px solid',
                borderColor: isSelected ? 'var(--text-primary)' : 'var(--border-color)',
                background: isSelected ? 'var(--btn-primary-bg)' : 'var(--bg-card)',
                color: isSelected ? 'var(--btn-primary-text)' : 'var(--text-secondary)',
                fontSize: '12px',
                fontWeight: isSelected ? 600 : 500,
                cursor: 'pointer',
                transition: 'all 0.12s ease',
              }}
            >
              <span>{h.avatarEmoji}</span>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {h.name.split(' ')[0]}
              </span>

              {hType === 'DAYS_LEAVES' && leaves > 0 && (
                <Badge
                  variant="danger"
                  style={{
                    backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : undefined,
                    color: isSelected ? '#ffffff' : undefined,
                    border: isSelected ? 'none' : undefined,
                  }}
                >
                  {leaves}
                </Badge>
              )}

              {hType === 'COUNT_BASED' && itemsTotal > 0 && (
                <Badge
                  variant="info"
                  style={{
                    backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : undefined,
                    color: isSelected ? '#ffffff' : undefined,
                    border: isSelected ? 'none' : undefined,
                  }}
                >
                  {itemsTotal}
                </Badge>
              )}

              {hType === 'FIXED' && (
                <span
                  style={{
                    fontSize: '9px',
                    opacity: isSelected ? 0.85 : 0.5,
                    fontWeight: 600,
                  }}
                >
                  Fixed
                </span>
              )}
            </button>
          );
        })}
      </SimpleGrid>

      <Flex
        bg="var(--bg-card)"
        borderRadius="xl"
        px={3.5}
        py={2}
        border="1px solid var(--border-color)"
        justify="space-between"
        align="center"
        fontSize="12px"
        transition="background-color 0.15s ease, border-color 0.15s ease"
      >
        <Box>
          <Text fontWeight="700" color="var(--text-primary)">
            {selectedHelper.name}{' '}
            <span style={{ color: 'var(--text-subtle)', fontWeight: 400 }}>
              • {selectedHelper.role}
            </span>
          </Text>
          <Text fontSize="11px" color="var(--text-muted)">
            {normalizedType === 'DAYS_LEAVES' &&
              `${formatCurrency(selectedHelper.baseSalary)}/mo • ${selectedHelper.paidLeavesAllowance} paid leaves`}
            {normalizedType === 'FIXED' &&
              `${formatCurrency(selectedHelper.baseSalary)}/mo • Fixed (No calendar)`}
            {normalizedType === 'COUNT_BASED' &&
              `${formatCurrency(ratePerItem)} / ${unitLabel} • ${salaryCalculation?.totalItemCount ?? 0} ${unitLabel} given`}
          </Text>
        </Box>

        <HStack gap={2}>
          {salaryCalculation && (
            <Text fontWeight="800" color="var(--text-primary)">
              {formatCurrency(salaryCalculation.netPayable)}
            </Text>
          )}
        </HStack>
      </Flex>

      {normalizedType === 'FIXED' ? (
        <Card style={{ padding: '28px 20px', textAlign: 'center' }}>
          <VStack gap={3} align="center">
            <Box
              w="48px"
              h="48px"
              borderRadius="full"
              bg="var(--bg-hover)"
              color="var(--text-muted)"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <CalendarOff size={24} />
            </Box>

            <Box>
              <Text fontSize="14px" fontWeight="700" color="var(--text-primary)" mb={1}>
                Fixed Salary — No Calendar Needed
              </Text>
              <Text
                fontSize="12px"
                color="var(--text-muted)"
                maxW="320px"
                mx="auto"
                lineHeight="1.5"
              >
                {selectedHelper.name} receives a fixed flat salary of{' '}
                <strong style={{ color: 'var(--text-primary)' }}>
                  {formatCurrency(selectedHelper.baseSalary)}
                </strong>{' '}
                every month. Daily attendance or leave deductions are not tracked on a calendar.
              </Text>
            </Box>

            <Box
              bg="var(--bg-card-subtle)"
              p={3}
              borderRadius="xl"
              border="1px solid var(--border-color)"
              w="100%"
              maxW="280px"
            >
              <Flex justify="space-between" fontSize="12px" mb={1}>
                <Text color="var(--text-muted)">Monthly Pay:</Text>
                <Text fontWeight="700" color="var(--text-primary)">
                  {formatCurrency(selectedHelper.baseSalary)}
                </Text>
              </Flex>
              <Flex justify="space-between" fontSize="12px">
                <Text color="var(--text-muted)">Adjustments:</Text>
                <Text fontWeight="600" color="var(--text-muted)">
                  Manage in Summary
                </Text>
              </Flex>
            </Box>

            {onNavigateToSummary && (
              <Button
                variant="outline"
                size="sm"
                onClick={onNavigateToSummary}
                icon={<ArrowRight size={13} />}
              >
                Go to Monthly Summary
              </Button>
            )}
          </VStack>
        </Card>
      ) : (
        <CalendarGrid
          calendarDays={calendarDays}
          recordsByDate={recordsByDate}
          helper={selectedHelper}
          onCellClick={handleCellClick}
        />
      )}

      {modalDate && normalizedType === 'DAYS_LEAVES' && (
        <DayDetailModal
          key={modalDate}
          isOpen={!!modalDate}
          onClose={() => setModalDate(null)}
          helper={selectedHelper}
          dateStr={modalDate}
          currentRecord={currentRecord}
          onSave={(status, note) => {
            onSetAttendance(selectedHelper.id, modalDate, status, note);
          }}
          onRemove={() => {
            onRemoveAttendance(selectedHelper.id, modalDate);
          }}
        />
      )}

      {modalDate && normalizedType === 'COUNT_BASED' && (
        <ItemCountModal
          key={modalDate}
          isOpen={!!modalDate}
          onClose={() => setModalDate(null)}
          helper={selectedHelper}
          dateStr={modalDate}
          currentRecord={currentRecord}
          onSave={(count, note, customRate) => {
            if (onSetItemCount) {
              onSetItemCount(selectedHelper.id, modalDate, count, note, customRate);
            } else {
              onSetAttendance(selectedHelper.id, modalDate, 'PRESENT', note);
            }
          }}
          onRemove={() => {
            onRemoveAttendance(selectedHelper.id, modalDate);
          }}
        />
      )}
    </VStack>
  );
};
