export function getCurrentMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function formatMonthDisplay(monthStr: string): string {
  if (!monthStr || !monthStr.includes('-')) return '';
  const [year, month] = monthStr.split('-').map(Number);
  const date = new Date(year, month - 1, 1);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export function getPreviousMonth(monthStr: string): string {
  const [year, month] = monthStr.split('-').map(Number);
  const date = new Date(year, month - 2, 1);
  const nextYear = date.getFullYear();
  const nextMonth = String(date.getMonth() + 1).padStart(2, '0');
  return `${nextYear}-${nextMonth}`;
}

export function getNextMonth(monthStr: string): string {
  const [year, month] = monthStr.split('-').map(Number);
  const date = new Date(year, month, 1);
  const nextYear = date.getFullYear();
  const nextMonth = String(date.getMonth() + 1).padStart(2, '0');
  return `${nextYear}-${nextMonth}`;
}

export function getDaysCountInMonth(monthStr: string): number {
  const [year, month] = monthStr.split('-').map(Number);
  return new Date(year, month, 0).getDate();
}

export interface CalendarDayInfo {
  dateStr: string;
  dayNumber: number;
  dayOfWeek: number;
  dayName: string;
  isCurrentMonth: boolean;
  isToday: boolean;
}

export function buildCalendarDays(monthStr: string): CalendarDayInfo[] {
  const [year, month] = monthStr.split('-').map(Number);
  const totalDays = new Date(year, month, 0).getDate();
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay();

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const days: CalendarDayInfo[] = [];

  const prevMonthTotalDays = new Date(year, month - 1, 0).getDate();
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const dayNum = prevMonthTotalDays - i;
    const prevDate = new Date(year, month - 2, dayNum);
    const dateStr = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    days.push({
      dateStr,
      dayNumber: dayNum,
      dayOfWeek: prevDate.getDay(),
      dayName: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][prevDate.getDay()],
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
    });
  }

  for (let d = 1; d <= totalDays; d++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const date = new Date(year, month - 1, d);
    const dayOfWeek = date.getDay();
    days.push({
      dateStr,
      dayNumber: d,
      dayOfWeek,
      dayName: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayOfWeek],
      isCurrentMonth: true,
      isToday: dateStr === todayStr,
    });
  }

  const remaining = (7 - (days.length % 7)) % 7;
  for (let i = 1; i <= remaining; i++) {
    const nextDate = new Date(year, month, i);
    const dateStr = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    days.push({
      dateStr,
      dayNumber: i,
      dayOfWeek: nextDate.getDay(),
      dayName: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][nextDate.getDay()],
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
    });
  }

  return days;
}

export function formatCurrency(amount: number): string {
  const rounded = Math.round(Number(amount) || 0);
  try {
    return `₹${rounded.toLocaleString('en-IN')}`;
  } catch {
    return `₹${rounded.toLocaleString()}`;
  }
}

export function formatDateToISO(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseISODate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function getWeekStartDate(dateStr?: string): string {
  const date = dateStr ? parseISODate(dateStr) : new Date();
  const dayOfWeek = date.getDay();
  const sunday = new Date(date);
  sunday.setDate(date.getDate() - dayOfWeek);
  return formatDateToISO(sunday);
}

function getWeekEndDate(weekStartDateStr: string): string {
  const sunday = parseISODate(weekStartDateStr);
  const saturday = new Date(sunday);
  saturday.setDate(sunday.getDate() + 6);
  return formatDateToISO(saturday);
}

export function getPreviousWeek(weekStartDateStr: string): string {
  const sunday = parseISODate(weekStartDateStr);
  sunday.setDate(sunday.getDate() - 7);
  return formatDateToISO(sunday);
}

export function getNextWeek(weekStartDateStr: string): string {
  const sunday = parseISODate(weekStartDateStr);
  sunday.setDate(sunday.getDate() + 7);
  return formatDateToISO(sunday);
}

export interface WeekDayInfo {
  dateStr: string;
  dayNumber: number;
  dayOfWeek: number;
  dayName: string;
  dayFullName: string;
  monthShort: string;
  isToday: boolean;
  isPast: boolean;
}

export function getDaysInWeek(weekStartDateStr: string): WeekDayInfo[] {
  const sunday = parseISODate(weekStartDateStr);
  const todayStr = formatDateToISO(new Date());

  const days: WeekDayInfo[] = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayFullNames = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];

  for (let i = 0; i < 7; i++) {
    const d = new Date(sunday);
    d.setDate(sunday.getDate() + i);
    const dateStr = formatDateToISO(d);
    days.push({
      dateStr,
      dayNumber: d.getDate(),
      dayOfWeek: d.getDay(),
      dayName: dayNames[d.getDay()],
      dayFullName: dayFullNames[d.getDay()],
      monthShort: d.toLocaleDateString('en-US', { month: 'short' }),
      isToday: dateStr === todayStr,
      isPast: dateStr < todayStr,
    });
  }

  return days;
}

export function formatWeekRangeDisplay(weekStartDateStr: string): string {
  const sunday = parseISODate(weekStartDateStr);
  const saturday = parseISODate(getWeekEndDate(weekStartDateStr));

  const sunMonth = sunday.toLocaleDateString('en-US', { month: 'short' });
  const satMonth = saturday.toLocaleDateString('en-US', { month: 'short' });
  const year = saturday.getFullYear();

  if (sunMonth === satMonth) {
    return `${sunMonth} ${sunday.getDate()} – ${saturday.getDate()}, ${year}`;
  }
  return `${sunMonth} ${sunday.getDate()} – ${satMonth} ${saturday.getDate()}, ${year}`;
}

export function formatDayDisplay(dateStr: string): string {
  if (!dateStr) return '';
  const d = parseISODate(dateStr);
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}
