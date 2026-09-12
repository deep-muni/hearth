import {
  AttendanceRecord,
  SalaryAdjustment,
  SalaryType,
  StaffMember,
  StaffSalaryCalculation,
} from '../types';
import { formatMonthDisplay, getDaysCountInMonth } from '@/utils/dateUtils';

export function normalizeSalaryType(type: SalaryType): 'DAYS_LEAVES' | 'FIXED' | 'COUNT_BASED' {
  if (type === 'COUNT_BASED') return 'COUNT_BASED';
  if (type === 'FIXED' || type === 'FIXED_MONTHLY' || type === 'STRICT_FLAT') return 'FIXED';
  return 'DAYS_LEAVES';
}

export function calculateMonthlySalary(
  staff: StaffMember,
  month: string,
  records: AttendanceRecord[],
  adjustment?: SalaryAdjustment
): StaffSalaryCalculation {
  const [year, monthNum] = month.split('-').map(Number);
  const totalDaysInMonth = getDaysCountInMonth(month);

  let weeklyOffsCount = 0;
  for (let day = 1; day <= totalDaysInMonth; day++) {
    const dayOfWeek = new Date(year, monthNum - 1, day).getDay();
    if (staff.weeklyOffDay >= 0 && dayOfWeek === staff.weeklyOffDay) {
      weeklyOffsCount++;
    }
  }

  const totalWorkingDays =
    staff.weeklyOffDay >= 0 ? Math.max(1, totalDaysInMonth - weeklyOffsCount) : totalDaysInMonth;

  const staffRecords = records.filter(
    (r) => r.staffId === staff.id && r.date.startsWith(month)
  );

  let fullLeavesCount = 0;
  let halfLeavesCount = 0;
  let paidLeavesCount = 0;
  let explicitPresentCount = 0;
  let totalItemCount = 0;
  let totalItemEarnings = 0;

  const ratePerItem = staff.ratePerItem ?? staff.baseSalary;
  const itemUnitName = staff.itemUnitName || 'items';

  staffRecords.forEach((r) => {
    if (typeof r.itemCount === 'number' && !isNaN(r.itemCount)) {
      totalItemCount += r.itemCount;
      const effectiveRate =
        typeof r.customRate === 'number' && r.customRate > 0 ? r.customRate : ratePerItem;
      totalItemEarnings += r.itemCount * effectiveRate;
    }

    switch (r.status) {
      case 'FULL_LEAVE':
        fullLeavesCount++;
        break;
      case 'HALF_LEAVE':
        halfLeavesCount++;
        break;
      case 'PAID_LEAVE':
        paidLeavesCount++;
        break;
      case 'PRESENT':
        explicitPresentCount++;
        break;
    }
  });

  const totalLeavesCount = fullLeavesCount + halfLeavesCount * 0.5;

  const calculatedDaysPresent = Math.max(
    0,
    totalWorkingDays - fullLeavesCount - halfLeavesCount * 0.5 - paidLeavesCount
  );
  const daysPresent = explicitPresentCount > 0 ? explicitPresentCount : calculatedDaysPresent;

  let perDayRate = 0;
  let baseAmount = staff.baseSalary;
  let deductions = 0;
  let deductibleLeavesCount = 0;

  const adj: SalaryAdjustment = adjustment || {
    staffId: staff.id,
    month,
    bonus: 0,
    advanceDeduction: 0,
    isPaid: false,
  };

  const normalizedType = normalizeSalaryType(staff.salaryType);

  if (normalizedType === 'COUNT_BASED') {
    baseAmount = Math.round(totalItemEarnings);
    deductions = 0;
    deductibleLeavesCount = 0;
    perDayRate = 0;
  } else if (normalizedType === 'FIXED') {
    baseAmount = staff.baseSalary;
    deductions = 0;
    deductibleLeavesCount = 0;
    perDayRate = Math.round((staff.baseSalary / totalDaysInMonth) * 100) / 100;
  } else {
    if (staff.salaryType === 'DAILY_WAGE') {
      perDayRate = staff.baseSalary;
      const billableDays = daysPresent + halfLeavesCount * 0.5 + paidLeavesCount;
      baseAmount = Math.round(billableDays * perDayRate);
      deductions = 0;
      deductibleLeavesCount = totalLeavesCount;
    } else {
      perDayRate = Math.round((staff.baseSalary / totalWorkingDays) * 100) / 100;
      deductibleLeavesCount = Math.max(0, totalLeavesCount - (staff.paidLeavesAllowance || 0));
      deductions = Math.round(deductibleLeavesCount * perDayRate);
      baseAmount = staff.baseSalary;
    }
  }

  const netPayable = Math.max(
    0,
    Math.round(baseAmount - deductions + (adj.bonus || 0) - (adj.advanceDeduction || 0))
  );

  return {
    staff,
    month,
    monthName: formatMonthDisplay(month),
    totalDaysInMonth,
    totalWorkingDays,
    weeklyOffsCount,
    daysPresent,
    fullLeavesCount,
    halfLeavesCount,
    paidLeavesCount,
    totalLeavesCount,
    deductibleLeavesCount,
    perDayRate,
    totalItemCount,
    ratePerItem,
    itemUnitName,
    baseAmount,
    deductions,
    bonus: adj.bonus || 0,
    advanceDeduction: adj.advanceDeduction || 0,
    netPayable,
    adjustment: adj,
  };
}
