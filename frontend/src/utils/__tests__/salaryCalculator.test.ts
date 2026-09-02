import { describe, it, expect } from 'vitest';
import { calculateMonthlySalary, normalizeSalaryType } from '../salaryCalculator';
import { HouseHelp, AttendanceRecord, MonthlyAdjustment } from '../../types';

describe('salaryCalculator logic tests', () => {
  describe('normalizeSalaryType', () => {
    it('normalizes COUNT_BASED', () => {
      expect(normalizeSalaryType('COUNT_BASED')).toBe('COUNT_BASED');
    });

    it('normalizes FIXED and STRICT_FLAT to FIXED', () => {
      expect(normalizeSalaryType('FIXED')).toBe('FIXED');
      expect(normalizeSalaryType('STRICT_FLAT')).toBe('FIXED');
    });

    it('defaults other types to DAYS_LEAVES', () => {
      expect(normalizeSalaryType('DAYS_LEAVES')).toBe('DAYS_LEAVES');
      expect(normalizeSalaryType('DAILY_WAGE')).toBe('DAYS_LEAVES');
      expect(normalizeSalaryType('FIXED_MONTHLY')).toBe('DAYS_LEAVES');
    });
  });

  describe('Type 1: DAYS_LEAVES calculation', () => {
    const cook: HouseHelp = {
      id: 'h-cook',
      name: 'Sunita',
      role: 'Cook',
      avatarEmoji: '👩‍🍳',
      colorTheme: 'pink',
      salaryType: 'DAYS_LEAVES',
      baseSalary: 10000,
      paidLeavesAllowance: 2,
      weeklyOffDay: 0, // Sunday
      isActive: true,
    };

    it('calculates full base salary when no leaves are taken', () => {
      const calc = calculateMonthlySalary(cook, '2026-09', []);
      expect(calc.baseAmount).toBe(10000);
      expect(calc.deductions).toBe(0);
      expect(calc.netPayable).toBe(10000);
      expect(calc.totalLeavesCount).toBe(0);
      expect(calc.deductibleLeavesCount).toBe(0);
    });

    it('does not deduct when leaves taken are within paid allowance', () => {
      const records: AttendanceRecord[] = [
        {
          id: '1',
          helperId: 'h-cook',
          date: '2026-09-04',
          status: 'FULL_LEAVE',
          updatedAt: '',
        },
        {
          id: '2',
          helperId: 'h-cook',
          date: '2026-09-12',
          status: 'FULL_LEAVE',
          updatedAt: '',
        },
      ];

      const calc = calculateMonthlySalary(cook, '2026-09', records);
      expect(calc.totalLeavesCount).toBe(2);
      expect(calc.deductibleLeavesCount).toBe(0);
      expect(calc.deductions).toBe(0);
      expect(calc.netPayable).toBe(10000);
    });

    it('deducts salary accurately when leaves exceed paid allowance', () => {
      const records: AttendanceRecord[] = [
        { id: '1', helperId: 'h-cook', date: '2026-09-04', status: 'FULL_LEAVE', updatedAt: '' },
        { id: '2', helperId: 'h-cook', date: '2026-09-12', status: 'FULL_LEAVE', updatedAt: '' },
        { id: '3', helperId: 'h-cook', date: '2026-09-18', status: 'FULL_LEAVE', updatedAt: '' },
        { id: '4', helperId: 'h-cook', date: '2026-09-25', status: 'HALF_LEAVE', updatedAt: '' },
      ];

      const calc = calculateMonthlySalary(cook, '2026-09', records);
      expect(calc.totalLeavesCount).toBe(3.5);
      expect(calc.deductibleLeavesCount).toBe(1.5);
      expect(calc.deductions).toBeGreaterThan(0);
      expect(calc.netPayable).toBe(10000 - calc.deductions);
    });

    it('applies bonus and advance deductions properly', () => {
      const adjustment: MonthlyAdjustment = {
        helperId: 'h-cook',
        month: '2026-09',
        bonus: 1000,
        advanceDeduction: 2000,
        isPaid: false,
      };

      const calc = calculateMonthlySalary(cook, '2026-09', [], adjustment);
      expect(calc.bonus).toBe(1000);
      expect(calc.advanceDeduction).toBe(2000);
      expect(calc.netPayable).toBe(9000);
    });

    it('ensures net payable never drops below 0', () => {
      const adjustment: MonthlyAdjustment = {
        helperId: 'h-cook',
        month: '2026-09',
        bonus: 0,
        advanceDeduction: 25000,
        isPaid: false,
      };

      const calc = calculateMonthlySalary(cook, '2026-09', [], adjustment);
      expect(calc.netPayable).toBe(0);
    });
  });

  describe('Type 2: FIXED salary calculation', () => {
    const driver: HouseHelp = {
      id: 'h-driver',
      name: 'Ramesh',
      role: 'Driver',
      avatarEmoji: '🚗',
      colorTheme: 'blue',
      salaryType: 'FIXED',
      baseSalary: 15000,
      paidLeavesAllowance: 0,
      weeklyOffDay: -1,
      isActive: true,
    };

    it('maintains fixed monthly salary without leave deductions', () => {
      const records: AttendanceRecord[] = [
        { id: '1', helperId: 'h-driver', date: '2026-09-05', status: 'FULL_LEAVE', updatedAt: '' },
      ];

      const calc = calculateMonthlySalary(driver, '2026-09', records);
      expect(calc.baseAmount).toBe(15000);
      expect(calc.deductions).toBe(0);
      expect(calc.netPayable).toBe(15000);
    });

    it('calculates net payable with bonus and advance for fixed salary', () => {
      const adj: MonthlyAdjustment = {
        helperId: 'h-driver',
        month: '2026-09',
        bonus: 2000,
        advanceDeduction: 5000,
        isPaid: true,
        paidOn: 'Sep 5',
      };

      const calc = calculateMonthlySalary(driver, '2026-09', [], adj);
      expect(calc.netPayable).toBe(12000);
      expect(calc.adjustment.isPaid).toBe(true);
    });
  });

  describe('Type 3: COUNT_BASED salary calculation', () => {
    const laundry: HouseHelp = {
      id: 'h-laundry',
      name: 'Pinky',
      role: 'Ironing',
      avatarEmoji: '🧺',
      colorTheme: 'purple',
      salaryType: 'COUNT_BASED',
      baseSalary: 20,
      ratePerItem: 20,
      itemUnitName: 'clothes',
      paidLeavesAllowance: 0,
      weeklyOffDay: -1,
      isActive: true,
    };

    it('calculates earnings based on item count and rate per item', () => {
      const records: AttendanceRecord[] = [
        { id: '1', helperId: 'h-laundry', date: '2026-09-02', itemCount: 10, updatedAt: '' },
        { id: '2', helperId: 'h-laundry', date: '2026-09-08', itemCount: 25, updatedAt: '' },
      ];

      const calc = calculateMonthlySalary(laundry, '2026-09', records);
      expect(calc.totalItemCount).toBe(35);
      expect(calc.baseAmount).toBe(35 * 20);
      expect(calc.netPayable).toBe(700);
    });

    it('supports custom rates for specific dates', () => {
      const records: AttendanceRecord[] = [
        { id: '1', helperId: 'h-laundry', date: '2026-09-02', itemCount: 10, updatedAt: '' }, // 10 * 20 = 200
        {
          id: '2',
          helperId: 'h-laundry',
          date: '2026-09-05',
          itemCount: 5,
          customRate: 50,
          updatedAt: '',
        }, // 5 * 50 = 250
      ];

      const calc = calculateMonthlySalary(laundry, '2026-09', records);
      expect(calc.totalItemCount).toBe(15);
      expect(calc.baseAmount).toBe(450);
      expect(calc.netPayable).toBe(450);
    });
  });
});
