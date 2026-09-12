export type ActiveTab = 'calendar' | 'summary' | 'config';

export type SalaryType =
  'DAYS_LEAVES' | 'FIXED' | 'COUNT_BASED' | 'FIXED_MONTHLY' | 'DAILY_WAGE' | 'STRICT_FLAT';

export type AttendanceStatus =
  'PRESENT' | 'FULL_LEAVE' | 'HALF_LEAVE' | 'PAID_LEAVE' | 'WEEKLY_OFF';

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  icon?: string;
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
  createdAt?: string;
}

export interface AttendanceRecord {
  id: string;
  staffId: string;
  date: string;
  status?: AttendanceStatus;
  itemCount?: number;
  customRate?: number;
  note?: string;
  updatedAt: string;
}

export interface SalaryAdjustment {
  staffId: string;
  month: string;
  bonus: number;
  advanceDeduction: number;
  note?: string;
  isPaid: boolean;
  paidOn?: string;
  paymentMethod?: 'Cash' | 'UPI' | 'Bank Transfer' | 'Other';
}

export interface StaffSalaryCalculation {
  staff: StaffMember;
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
  adjustment: SalaryAdjustment;
}
