import { describe, it, expect } from 'vitest';
import { calculateMonthlySalary, normalizeSalaryType } from '../salaryCalculator';
import { StaffMember, AttendanceRecord, SalaryAdjustment } from '../../types';

describe('salaryCalculator', () => {
  const dummyStaff: StaffMember = {
    id: 'staff_1',
    name: 'Geeta',
    role: 'Maid',
    salaryType: 'DAYS_LEAVES',
    baseSalary: 4000,
    paidLeavesAllowance: 2,
    weeklyOffDay: 0,
    isActive: true,
  };

  const defaultAdj: SalaryAdjustment = {
    staffId: 'staff_1',
    month: '2026-03',
    bonus: 0,
    advanceDeduction: 0,
    isPaid: false,
  };

  it('normalizes salary type correctly', () => {
    expect(normalizeSalaryType('DAYS_LEAVES')).toBe('DAYS_LEAVES');
    expect(normalizeSalaryType('COUNT_BASED')).toBe('COUNT_BASED');
    expect(normalizeSalaryType('FIXED')).toBe('FIXED');
    expect(normalizeSalaryType('FIXED_MONTHLY')).toBe('FIXED');
    expect(normalizeSalaryType('STRICT_FLAT')).toBe('FIXED');
  });

  it('calculates full salary when leaves are within allowance', () => {
    const records: AttendanceRecord[] = [
      {
        id: '1',
        staffId: 'staff_1',
        date: '2026-03-05',
        status: 'FULL_LEAVE',
        updatedAt: '2026-03-05T00:00:00Z',
      },
      {
        id: '2',
        staffId: 'staff_1',
        date: '2026-03-12',
        status: 'FULL_LEAVE',
        updatedAt: '2026-03-12T00:00:00Z',
      },
    ];

    const result = calculateMonthlySalary(dummyStaff, '2026-03', records, defaultAdj);
    expect(result.totalLeavesCount).toBe(2);
    expect(result.deductibleLeavesCount).toBe(0);
    expect(result.deductions).toBe(0);
    expect(result.netPayable).toBe(4000);
  });

  it('deducts salary for leaves exceeding allowance', () => {
    const records: AttendanceRecord[] = [
      {
        id: '1',
        staffId: 'staff_1',
        date: '2026-03-05',
        status: 'FULL_LEAVE',
        updatedAt: '2026-03-05T00:00:00Z',
      },
      {
        id: '2',
        staffId: 'staff_1',
        date: '2026-03-12',
        status: 'FULL_LEAVE',
        updatedAt: '2026-03-12T00:00:00Z',
      },
      {
        id: '3',
        staffId: 'staff_1',
        date: '2026-03-19',
        status: 'FULL_LEAVE',
        updatedAt: '2026-03-19T00:00:00Z',
      },
    ];

    const result = calculateMonthlySalary(dummyStaff, '2026-03', records, defaultAdj);
    expect(result.totalLeavesCount).toBe(3);
    expect(result.deductibleLeavesCount).toBe(1);
    expect(result.deductions).toBeGreaterThan(0);
    expect(result.netPayable).toBeLessThan(4000);
  });
});
