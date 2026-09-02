import { AttendanceRecord, HelperSalaryCalculation, HouseHelp, MonthlyAdjustment } from '../types';
import { formatMonthDisplay, getDaysCountInMonth } from './dateUtils';

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

  helperRecords.forEach((r) => {
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

  // Unmarked days default to PRESENT for working days (or we take explicit count if month has attendance)
  // To give intuitive feel:
  // Days present = totalWorkingDays - (fullLeavesCount + halfLeavesCount + paidLeavesCount)
  // unless explicitPresentCount is tracked
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

  if (helper.salaryType === 'FIXED_MONTHLY') {
    // Fixed monthly salary with paid leave allowance
    perDayRate = Math.round((helper.baseSalary / totalWorkingDays) * 100) / 100;
    
    // Deduct only when leaves exceed paid leaves allowance
    deductibleLeavesCount = Math.max(0, totalLeavesCount - helper.paidLeavesAllowance);
    deductions = Math.round(deductibleLeavesCount * perDayRate);
  } else if (helper.salaryType === 'DAILY_WAGE') {
    // Pay based on days worked
    perDayRate = helper.baseSalary;
    const billableDays = daysPresent + (halfLeavesCount * 0.5) + paidLeavesCount;
    baseAmount = Math.round(billableDays * perDayRate);
    deductions = 0;
    deductibleLeavesCount = totalLeavesCount;
  } else if (helper.salaryType === 'STRICT_FLAT') {
    // Flat monthly, no leave deductions
    perDayRate = Math.round((helper.baseSalary / totalDaysInMonth) * 100) / 100;
    deductions = 0;
    deductibleLeavesCount = 0;
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
    baseAmount,
    deductions,
    bonus: adj.bonus || 0,
    advanceDeduction: adj.advanceDeduction || 0,
    netPayable,
    adjustment: adj,
  };
}
