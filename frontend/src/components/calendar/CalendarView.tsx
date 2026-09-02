"use client";

import React, { useState } from 'react';
import {
  Box,
  Flex,
  HStack,
  VStack,
  Text,
  Badge,
  SimpleGrid,
} from '@chakra-ui/react';
import { AttendanceRecord, AttendanceStatus, HelperSalaryCalculation, HouseHelp } from '@/types';
import {
  buildCalendarDays,
  CalendarDayInfo,
  formatCurrency,
} from '@/utils/dateUtils';
import { DayDetailModal } from './DayDetailModal';
import {
  Calendar as CalIcon,
  CheckCircle2,
  Clock,
  HelpCircle,
  Sparkles,
  UserCheck,
  AlertCircle,
  Coffee,
  Flame,
} from 'lucide-react';

interface CalendarViewProps {
  helpers: HouseHelp[];
  selectedHelperId: string;
  onSelectHelper: (id: string) => void;
  currentMonth: string;
  attendance: AttendanceRecord[];
  onSetAttendance: (helperId: string, date: string, status: AttendanceStatus, note?: string) => void;
  onRemoveAttendance: (helperId: string, date: string) => void;
  onClearMonth: (helperId: string, month: string) => void;
  salaryCalculation?: HelperSalaryCalculation;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  helpers,
  selectedHelperId,
  onSelectHelper,
  currentMonth,
  attendance,
  onSetAttendance,
  onRemoveAttendance,
  onClearMonth,
  salaryCalculation,
}) => {
  const selectedHelper = helpers.find((h) => h.id === selectedHelperId) || helpers[0];

  const [modalDate, setModalDate] = useState<string | null>(null);

  if (!selectedHelper) {
    return (
      <Box p={8} textAlign="center">
        <Text fontSize="lg" color="gray.500">
          No house helps found. Please add a helper in the Staff Config tab!
        </Text>
      </Box>
    );
  }

  const calendarDays = buildCalendarDays(currentMonth);

  // Map attendance records for current helper by date
  const recordsByDate = new Map<string, AttendanceRecord>();
  attendance
    .filter((a) => a.helperId === selectedHelper.id && a.date.startsWith(currentMonth))
    .forEach((r) => recordsByDate.set(r.date, r));

  const handleCellClick = (dayInfo: CalendarDayInfo) => {
    if (!dayInfo.isCurrentMonth) return;
    setModalDate(dayInfo.dateStr);
  };

  const handleQuickMarkAllPresent = () => {
    if (confirm(`Mark all working days in ${currentMonth} as Present for ${selectedHelper.name}?`)) {
      calendarDays
        .filter((d) => d.isCurrentMonth)
        .forEach((d) => {
          // If not a weekly off
          const isWeeklyOff = selectedHelper.weeklyOffDay >= 0 && d.dayOfWeek === selectedHelper.weeklyOffDay;
          if (isWeeklyOff) {
            onSetAttendance(selectedHelper.id, d.dateStr, 'WEEKLY_OFF');
          } else {
            onSetAttendance(selectedHelper.id, d.dateStr, 'PRESENT');
          }
        });
    }
  };

  const currentRecord = modalDate ? recordsByDate.get(modalDate) : undefined;

  return (
    <VStack gap={6} align="stretch" maxW="1400px" mx="auto" w="100%">
      {/* 1. Helper Selector Tabs (Cute Avatar Ribbon) */}
      <Box>
        <Text fontSize="xs" fontWeight="800" color="#9d174d" textTransform="uppercase" letterSpacing="0.8px" mb={2}>
          Select Staff Member
        </Text>
        <Flex gap={3} overflowX="auto" pb={2} className="no-scrollbar">
          {helpers.map((h) => {
            const isSelected = h.id === selectedHelper.id;
            // Calculate helper's leaves this month
            const helperRecords = attendance.filter(
              (a) => a.helperId === h.id && a.date.startsWith(currentMonth)
            );
            const leavesCount = helperRecords.reduce((acc, curr) => {
              if (curr.status === 'FULL_LEAVE') return acc + 1;
              if (curr.status === 'HALF_LEAVE') return acc + 0.5;
              return acc;
            }, 0);

            return (
              <Box
                key={h.id}
                onClick={() => onSelectHelper(h.id)}
                p={3.5}
                borderRadius="2xl"
                border="2px solid"
                borderColor={isSelected ? '#f43f5e' : '#ffe4e6'}
                bg={isSelected ? 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)' : '#ffffff'}
                boxShadow={isSelected ? '0 8px 20px -4px rgba(244, 63, 94, 0.25)' : '0 2px 6px rgba(0,0,0,0.03)'}
                cursor="pointer"
                minW={{ base: '190px', md: '220px' }}
                transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                _hover={{ transform: 'translateY(-2px)', borderColor: '#fb7185' }}
              >
                <HStack gap={3}>
                  <Box
                    w="44px"
                    h="44px"
                    borderRadius="xl"
                    bg={isSelected ? '#ffffff' : '#fff5f5'}
                    border="1.5px solid"
                    borderColor={isSelected ? '#f43f5e' : '#fecdd3'}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    fontSize="22px"
                    boxShadow="sm"
                  >
                    {h.avatarEmoji}
                  </Box>
                  <Box flex={1}>
                    <Text
                      fontSize="sm"
                      fontWeight="800"
                      color={isSelected ? '#9f1239' : '#1e293b'}
                      lineClamp={1}
                    >
                      {h.name}
                    </Text>
                    <Text fontSize="xs" color="#64748b" fontWeight="600">
                      {h.role}
                    </Text>
                    <HStack mt={1} gap={1.5}>
                      <Badge
                        fontSize="10px"
                        bg={leavesCount > (h.paidLeavesAllowance || 0) ? '#fee2e2' : '#f0fdf4'}
                        color={leavesCount > (h.paidLeavesAllowance || 0) ? '#991b1b' : '#166534'}
                        border="1px solid"
                        borderColor={leavesCount > (h.paidLeavesAllowance || 0) ? '#fca5a5' : '#bbf7d0'}
                        borderRadius="full"
                        px={1.5}
                        py={0}
                      >
                        {leavesCount} {leavesCount === 1 ? 'leave' : 'leaves'}
                      </Badge>
                    </HStack>
                  </Box>
                </HStack>
              </Box>
            );
          })}
        </Flex>
      </Box>

      {/* 2. Selected Helper Summary Banner */}
      <Box
        bg="#ffffff"
        borderRadius="3xl"
        p={{ base: 4, md: 6 }}
        border="2px solid #ffd4dc"
        boxShadow="0 10px 30px -10px rgba(255, 107, 139, 0.12)"
      >
        <Flex
          direction={{ base: 'column', lg: 'row' }}
          align={{ base: 'flex-start', lg: 'center' }}
          justify="space-between"
          gap={4}
        >
          <HStack gap={4}>
            <Box
              w="60px"
              h="60px"
              borderRadius="2xl"
              bg="linear-gradient(135deg, #ffe4e6 0%, #fecdd3 100%)"
              border="2px solid #fb7185"
              display="flex"
              alignItems="center"
              justifyContent="center"
              fontSize="32px"
              boxShadow="0 4px 12px rgba(251, 113, 133, 0.25)"
            >
              {selectedHelper.avatarEmoji}
            </Box>
            <Box>
              <HStack gap={2}>
                <Text fontSize={{ base: 'lg', md: 'xl' }} fontWeight="800" color="#831843">
                  {selectedHelper.name}
                </Text>
                <Badge
                  bg="#fdf2f8"
                  color="#be185d"
                  border="1px solid #fbcfe8"
                  borderRadius="full"
                  px={2.5}
                  py={0.5}
                  fontWeight="700"
                  fontSize="xs"
                >
                  {selectedHelper.role}
                </Badge>
              </HStack>

              <Text fontSize="xs" color="#475569" mt={1}>
                {selectedHelper.salaryType === 'FIXED_MONTHLY' && (
                  <>
                    Fixed monthly: <strong style={{ color: '#0f172a' }}>{formatCurrency(selectedHelper.baseSalary)}</strong> •{' '}
                    <strong style={{ color: '#15803d' }}>{selectedHelper.paidLeavesAllowance} paid leaves</strong> allowed •{' '}
                    Per-day rate: ~{formatCurrency(salaryCalculation?.perDayRate || 0)}
                  </>
                )}
                {selectedHelper.salaryType === 'DAILY_WAGE' && (
                  <>
                    Daily wage: <strong style={{ color: '#0f172a' }}>{formatCurrency(selectedHelper.baseSalary)} / day</strong> •{' '}
                    Paid per active working day
                  </>
                )}
                {selectedHelper.salaryType === 'STRICT_FLAT' && (
                  <>
                    Flat fixed: <strong style={{ color: '#0f172a' }}>{formatCurrency(selectedHelper.baseSalary)} / month</strong> •{' '}
                    No leave deductions
                  </>
                )}
                {selectedHelper.weeklyOffDay >= 0 && (
                  <span>
                    {' '}• Weekly off: {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][selectedHelper.weeklyOffDay]}
                  </span>
                )}
              </Text>
            </Box>
          </HStack>

          {/* Quick stats & action buttons */}
          <HStack gap={2} wrap="wrap">
            {salaryCalculation && (
              <Box
                bg="#fff1f2"
                border="1.5px solid #fecdd3"
                borderRadius="2xl"
                px={4}
                py={2}
                textAlign="center"
              >
                <Text fontSize="10px" fontWeight="700" color="#9f1239" textTransform="uppercase">
                  Projected Pay
                </Text>
                <Text fontSize="md" fontWeight="800" color="#881337">
                  {formatCurrency(salaryCalculation.netPayable)}
                </Text>
              </Box>
            )}

            <button
              onClick={handleQuickMarkAllPresent}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '14px',
                border: '1.5px solid #a7f3d0',
                background: '#ecfdf5',
                color: '#065f46',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
              }}
            >
              <CheckCircle2 size={15} />
              <span>Fill All Present</span>
            </button>

            <button
              onClick={() => {
                if (confirm(`Reset all attendance for ${selectedHelper.name} in ${currentMonth}?`)) {
                  onClearMonth(selectedHelper.id, currentMonth);
                }
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 12px',
                borderRadius: '14px',
                border: '1px solid #fed7aa',
                background: '#fff7ed',
                color: '#9a3412',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Clear Month
            </button>
          </HStack>
        </Flex>
      </Box>

      {/* 3. Calendar Grid */}
      <Box
        bg="#ffffff"
        borderRadius="3xl"
        border="2px solid #ffd4dc"
        p={{ base: 3, md: 6 }}
        boxShadow="0 10px 35px -10px rgba(255, 107, 139, 0.15)"
      >
        {/* Day-of-week Headers */}
        <SimpleGrid columns={7} gap={{ base: 1.5, md: 3 }} mb={3}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, index) => {
            const isSunday = index === 0;
            return (
              <Box
                key={d}
                py={2}
                textAlign="center"
                borderRadius="xl"
                bg={isSunday ? '#fff1f2' : '#f8fafc'}
                border="1px solid"
                borderColor={isSunday ? '#fecdd3' : '#e2e8f0'}
              >
                <Text
                  fontSize="xs"
                  fontWeight="800"
                  color={isSunday ? '#be123c' : '#475569'}
                  textTransform="uppercase"
                  letterSpacing="0.5px"
                >
                  {d}
                </Text>
              </Box>
            );
          })}
        </SimpleGrid>

        {/* Days Matrix */}
        <SimpleGrid columns={7} gap={{ base: 1.5, md: 3 }}>
          {calendarDays.map((dayInfo, idx) => {
            const isWeeklyOffDay = selectedHelper.weeklyOffDay >= 0 && dayInfo.dayOfWeek === selectedHelper.weeklyOffDay;
            const record = recordsByDate.get(dayInfo.dateStr);

            // Determine effective status:
            // If explicit record exists, use that.
            // If not explicit, but it is weekly off day, default to WEEKLY_OFF.
            // Otherwise, default to PRESENT.
            let effectiveStatus: AttendanceStatus = 'PRESENT';
            if (record) {
              effectiveStatus = record.status;
            } else if (isWeeklyOffDay) {
              effectiveStatus = 'WEEKLY_OFF';
            }

            // Cell styling based on effective status
            let cellBg = '#ffffff';
            let borderColor = '#f1f5f9';
            let statusBadge = null;

            if (!dayInfo.isCurrentMonth) {
              cellBg = '#fafafa';
              borderColor = '#f4f4f5';
            } else {
              switch (effectiveStatus) {
                case 'FULL_LEAVE':
                  cellBg = '#fff1f2';
                  borderColor = '#fda4af';
                  statusBadge = {
                    text: 'Full Leave',
                    emoji: '🚫',
                    color: '#9f1239',
                    bg: '#ffe4e6',
                    border: '#fecdd3',
                  };
                  break;
                case 'HALF_LEAVE':
                  cellBg = '#fffbeb';
                  borderColor = '#fcd34d';
                  statusBadge = {
                    text: 'Half Day',
                    emoji: '🌓',
                    color: '#92400e',
                    bg: '#fef3c7',
                    border: '#fde68a',
                  };
                  break;
                case 'PAID_LEAVE':
                  cellBg = '#f5f3ff';
                  borderColor = '#c4b5fd';
                  statusBadge = {
                    text: 'Paid Leave',
                    emoji: '🎁',
                    color: '#5b21b6',
                    bg: '#ede9fe',
                    border: '#ddd6fe',
                  };
                  break;
                case 'WEEKLY_OFF':
                  cellBg = '#f8fafc';
                  borderColor = '#cbd5e1';
                  statusBadge = {
                    text: 'Off Day',
                    emoji: '☕',
                    color: '#475569',
                    bg: '#e2e8f0',
                    border: '#cbd5e1',
                  };
                  break;
                case 'PRESENT':
                default:
                  cellBg = '#f0fdf4';
                  borderColor = '#bbf7d0';
                  statusBadge = {
                    text: 'Present',
                    emoji: '✅',
                    color: '#166534',
                    bg: '#dcfce7',
                    border: '#a7f3d0',
                  };
                  break;
              }
            }

            return (
              <Box
                key={`${dayInfo.dateStr}-${idx}`}
                onClick={() => handleCellClick(dayInfo)}
                minH={{ base: '75px', md: '105px' }}
                p={{ base: 1.5, md: 2.5 }}
                borderRadius="2xl"
                border="2px solid"
                borderColor={borderColor}
                bg={cellBg}
                opacity={dayInfo.isCurrentMonth ? 1 : 0.4}
                cursor={dayInfo.isCurrentMonth ? 'pointer' : 'default'}
                position="relative"
                display="flex"
                flexDirection="column"
                justifyContent="space-between"
                transition="all 0.15s ease"
                _hover={
                  dayInfo.isCurrentMonth
                    ? {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 16px -4px rgba(0,0,0,0.08)',
                        borderColor: '#f43f5e',
                      }
                    : {}
                }
              >
                {/* Day number & Today indicator */}
                <Flex align="center" justify="space-between">
                  <Text
                    fontSize={{ base: 'xs', md: 'sm' }}
                    fontWeight="800"
                    color={
                      dayInfo.isToday
                        ? '#be123c'
                        : dayInfo.isCurrentMonth
                        ? '#1e293b'
                        : '#94a3b8'
                    }
                  >
                    {dayInfo.dayNumber}
                  </Text>

                  {dayInfo.isToday && (
                    <Badge
                      fontSize="9px"
                      bg="#e11d48"
                      color="#ffffff"
                      borderRadius="full"
                      px={1.5}
                      py={0.2}
                      fontWeight="800"
                    >
                      Today
                    </Badge>
                  )}
                </Flex>

                {/* Status Badge */}
                {dayInfo.isCurrentMonth && statusBadge && (
                  <Box mt={1}>
                    <HStack
                      gap={1}
                      bg={statusBadge.bg}
                      color={statusBadge.color}
                      border="1px solid"
                      borderColor={statusBadge.border}
                      borderRadius="xl"
                      px={1.5}
                      py={0.5}
                      w="fit-content"
                    >
                      <Text fontSize="10px">{statusBadge.emoji}</Text>
                      <Text
                        fontSize="10px"
                        fontWeight="700"
                        display={{ base: 'none', md: 'inline' }}
                      >
                        {statusBadge.text}
                      </Text>
                    </HStack>

                    {/* Note indicator */}
                    {record?.note && (
                      <Text
                        fontSize="9px"
                        color="#64748b"
                        mt={1}
                        lineClamp={1}
                        fontStyle="italic"
                      >
                        💬 {record.note}
                      </Text>
                    )}
                  </Box>
                )}
              </Box>
            );
          })}
        </SimpleGrid>

        {/* Legend */}
        <Flex
          mt={6}
          pt={4}
          borderTop="1.5px dashed #fed7e2"
          align="center"
          justify="center"
          gap={{ base: 2, md: 4 }}
          wrap="wrap"
        >
          <Text fontSize="xs" fontWeight="700" color="#64748b">
            Legend (Tap any day to change):
          </Text>
          <HStack gap={1.5}>
            <Text fontSize="12px">✅</Text>
            <Text fontSize="xs" fontWeight="600" color="#166534">
              Present
            </Text>
          </HStack>
          <HStack gap={1.5}>
            <Text fontSize="12px">🚫</Text>
            <Text fontSize="xs" fontWeight="600" color="#9f1239">
              Full Leave
            </Text>
          </HStack>
          <HStack gap={1.5}>
            <Text fontSize="12px">🌓</Text>
            <Text fontSize="xs" fontWeight="600" color="#92400e">
              Half Day (0.5)
            </Text>
          </HStack>
          <HStack gap={1.5}>
            <Text fontSize="12px">🎁</Text>
            <Text fontSize="xs" fontWeight="600" color="#5b21b6">
              Paid Leave
            </Text>
          </HStack>
          <HStack gap={1.5}>
            <Text fontSize="12px">☕</Text>
            <Text fontSize="xs" fontWeight="600" color="#334155">
              Weekly Off
            </Text>
          </HStack>
        </Flex>
      </Box>

      {/* Day Detail Modal */}
      {modalDate && (
        <DayDetailModal
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
    </VStack>
  );
};
