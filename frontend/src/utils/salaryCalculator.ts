import { AttendanceRecord, HelperSalaryCalculation, HouseHelp, MonthlyAdjustment, SalaryType } from '../types';
import { formatMonthDisplay, getDaysCountInMonth } from './dateUtils';

export function normalizeSalaryType(type: SalaryType): 'DAYS_LEAVES' | 'FIXED' | 'COUNT_BASED' {
  if (type === 'COUNT_BASED') return 'COUNT_BASED';
  if (type === 'FIXED' || type === 'STRICT_FLAT') return 'FIXED';
  return 'DAYS_LEAVES';
}

export function calculateMonthlySalary(
  helper: HouseHelp,
  month: string,
  records: AttendanceRecord[],
  adjustment?: MonthlyAdjustment
): HelperSalaryCalculation {
  const [year, monthNum] = month.split('-').map(Number);
  const totalDaysInMonth = getDaysCountInMonth(month);

  // Count weekly offs in the month
  let weeklyOffsCount = 0;
  for (let day = 1; day <= totalDaysInMonth; day++) {
    const dayOfWeek = new Date(year, monthNum - 1, day).getDay();
    if (helper.weeklyOffDay >= 0 && dayOfWeek === helper.weeklyOffDay) {
      weeklyOffsCount++;
    }
  }

  const totalWorkingDays = helper.weeklyOffDay >= 0 ? Math.max(1, totalDaysInMonth - weeklyOffsCount) : totalDaysInMonth;

  // Filter records for this helper and month
  const helperRecords = records.filter(
    (r) => r.helperId === helper.id && r.date.startsWith(month)
  );

  let fullLeavesCount = 0;
  let halfLeavesCount = 0;
  let paidLeavesCount = 0;
  let explicitPresentCount = 0;
  let totalItemCount = 0;
  let totalItemEarnings = 0;

  const ratePerItem = helper.ratePerItem ?? helper.baseSalary;
  const itemUnitName = helper.itemUnitName || 'items';

  helperRecords.forEach((r) => {
    if (typeof r.itemCount === 'number' && !isNaN(r.itemCount)) {
      totalItemCount += r.itemCount;
      const effectiveRate = typeof r.customRate === 'number' && r.customRate > 0
        ? r.customRate
        : ratePerItem;
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

  // Effective leave days
  const totalLeavesCount = fullLeavesCount + halfLeavesCount * 0.5;

  const calculatedDaysPresent = Math.max(
    0,
    totalWorkingDays - fullLeavesCount - halfLeavesCount * 0.5 - paidLeavesCount
  );
  const daysPresent = explicitPresentCount > 0 ? explicitPresentCount : calculatedDaysPresent;

  let perDayRate = 0;
  let baseAmount = helper.baseSalary;
  let deductions = 0;
  let deductibleLeavesCount = 0;

  const adj: MonthlyAdjustment = adjustment || {
    helperId: helper.id,
    month,
    bonus: 0,
    advanceDeduction: 0,
    isPaid: false,
  };

  const normalizedType = normalizeSalaryType(helper.salaryType);

  if (normalizedType === 'COUNT_BASED') {
    // 3rd Type: Salary based on count (items given per date, cost can be default rate or custom per date)
    baseAmount = Math.round(totalItemEarnings);
    deductions = 0;
    deductibleLeavesCount = 0;
    perDayRate = 0;
  } else if (normalizedType === 'FIXED') {
    // 2nd Type: Fixed monthly salary (no calendar tracking)
    baseAmount = helper.baseSalary;
    deductions = 0;
    deductibleLeavesCount = 0;
    perDayRate = Math.round((helper.baseSalary / totalDaysInMonth) * 100) / 100;
  } else {
    // 1st Type: Salary based on days (leaves) - uses calendar
    if (helper.salaryType === 'DAILY_WAGE') {
      perDayRate = helper.baseSalary;
      const billableDays = daysPresent + (halfLeavesCount * 0.5) + paidLeavesCount;
      baseAmount = Math.round(billableDays * perDayRate);
      deductions = 0;
      deductibleLeavesCount = totalLeavesCount;
    } else {
      // Standard DAYS_LEAVES / FIXED_MONTHLY
      perDayRate = Math.round((helper.baseSalary / totalWorkingDays) * 100) / 100;
      deductibleLeavesCount = Math.max(0, totalLeavesCount - (helper.paidLeavesAllowance || 0));
      deductions = Math.round(deductibleLeavesCount * perDayRate);
      baseAmount = helper.baseSalary;
    }
  }

  const netPayable = Math.max(
    0,
    Math.round(baseAmount - deductions + (adj.bonus || 0) - (adj.advanceDeduction || 0))
  );

  return {
    helper,
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
