export type SalaryType =
  | 'DAYS_LEAVES'
  | 'FIXED'
  | 'COUNT_BASED'
  | 'FIXED_MONTHLY'
  | 'DAILY_WAGE'
  | 'STRICT_FLAT';

export type AttendanceStatus =
  | 'PRESENT'
  | 'FULL_LEAVE'
  | 'HALF_LEAVE'
  | 'PAID_LEAVE'
  | 'WEEKLY_OFF';

export type HelperColorTheme =
  | 'pink'
  | 'purple'
  | 'teal'
  | 'orange'
  | 'blue'
  | 'emerald'
  | 'rose';

export interface HouseHelp {
  id: string;
  name: string;
  role: string;
  avatarEmoji: string;
  colorTheme: HelperColorTheme;
  salaryType: SalaryType;
  baseSalary: number; // monthly fixed salary or base rate
  ratePerItem?: number; // rate per item for COUNT_BASED (defaults to baseSalary)
  itemUnitName?: string; // unit label e.g. "items", "clothes", "tiffin" (default "items")
  paidLeavesAllowance: number; // e.g. 2 free leaves allowed per month for DAYS_LEAVES
  weeklyOffDay: number; // 0 = Sunday, 1 = Monday ... 6 = Saturday, -1 = None
  phone?: string;
  notes?: string;
  joinDate?: string;
  leftDate?: string;
  isActive: boolean;
}

export interface AttendanceRecord {
  id: string;
  helperId: string;
  date: string; // YYYY-MM-DD
  status?: AttendanceStatus; // For DAYS_LEAVES
  itemCount?: number; // For COUNT_BASED: number of items given on this date
  customRate?: number; // Optional custom rate/cost per item for this date
  note?: string;
  updatedAt: string;
}

export interface MonthlyAdjustment {
  helperId: string;
  month: string; // YYYY-MM
  bonus: number;
  advanceDeduction: number;
  note?: string;
  isPaid: boolean;
  paidOn?: string;
  paymentMethod?: 'Cash' | 'UPI' | 'Bank Transfer' | 'Other';
}

export interface HelperSalaryCalculation {
  helper: HouseHelp;
  month: string; // YYYY-MM
  monthName: string;
  totalDaysInMonth: number;
  totalWorkingDays: number;
  weeklyOffsCount: number;
  daysPresent: number;
  fullLeavesCount: number;
  halfLeavesCount: number;
  paidLeavesCount: number;
  totalLeavesCount: number; // fullLeaves + halfLeaves*0.5
  deductibleLeavesCount: number;
  perDayRate: number;
  // For COUNT_BASED
  totalItemCount: number;
  ratePerItem: number;
  itemUnitName: string;
  // Financials
  baseAmount: number;
  deductions: number;
  bonus: number;
  advanceDeduction: number;
  netPayable: number;
  adjustment: MonthlyAdjustment;
}
