export type SalaryType = 'FIXED_MONTHLY' | 'DAILY_WAGE' | 'STRICT_FLAT';

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
  baseSalary: number; // monthly fixed salary or daily wage
  paidLeavesAllowance: number; // e.g. 2 free leaves allowed per month
  weeklyOffDay: number; // 0 = Sunday, 1 = Monday ... 6 = Saturday, -1 = None
  phone?: string;
  notes?: string;
  joinDate?: string;
  isActive: boolean;
}

export interface AttendanceRecord {
  id: string;
  helperId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
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
  baseAmount: number;
  deductions: number;
  bonus: number;
  advanceDeduction: number;
  netPayable: number;
  adjustment: MonthlyAdjustment;
}
