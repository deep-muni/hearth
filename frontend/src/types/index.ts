export type SalaryType =
  'DAYS_LEAVES' | 'FIXED' | 'COUNT_BASED' | 'FIXED_MONTHLY' | 'DAILY_WAGE' | 'STRICT_FLAT';

export type AttendanceStatus =
  'PRESENT' | 'FULL_LEAVE' | 'HALF_LEAVE' | 'PAID_LEAVE' | 'WEEKLY_OFF';

export type HelperColorTheme = 'pink' | 'purple' | 'teal' | 'orange' | 'blue' | 'emerald' | 'rose';

export interface HouseHelp {
  id: string;
  name: string;
  role: string;
  avatarEmoji: string;
  colorTheme: HelperColorTheme;
  salaryType: SalaryType;
  baseSalary: number;
  ratePerItem?: number;
  itemUnitName?: string;
  paidLeavesAllowance: number;
  weeklyOffDay: number;
  phone?: string;
  notes?: string;
  joinDate?: string;
  leftDate?: string;
  isActive: boolean;
}

export interface AttendanceRecord {
  id: string;
  helperId: string;
  date: string;
  status?: AttendanceStatus;
  itemCount?: number;
  customRate?: number;
  note?: string;
  updatedAt: string;
}

export interface MonthlyAdjustment {
  helperId: string;
  month: string;
  bonus: number;
  advanceDeduction: number;
  note?: string;
  isPaid: boolean;
  paidOn?: string;
  paymentMethod?: 'Cash' | 'UPI' | 'Bank Transfer' | 'Other';
}

export interface HelperSalaryCalculation {
  helper: HouseHelp;
  month: string;
  monthName: string;
  totalDaysInMonth: number;
  totalWorkingDays: number;
  weeklyOffsCount: number;
  daysPresent: number;
  fullLeavesCount: number;
  halfLeavesCount: number;
  paidLeavesCount: number;
  totalLeavesCount: number;
  deductibleLeavesCount: number;
  perDayRate: number;
  totalItemCount: number;
  ratePerItem: number;
  itemUnitName: string;
  baseAmount: number;
  deductions: number;
  bonus: number;
  advanceDeduction: number;
  netPayable: number;
  adjustment: MonthlyAdjustment;
}
