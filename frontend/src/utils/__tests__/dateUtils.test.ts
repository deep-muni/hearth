import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  getCurrentMonth,
  formatMonthDisplay,
  getPreviousMonth,
  getNextMonth,
  getDaysCountInMonth,
  buildCalendarDays,
} from '../dateUtils';

describe('dateUtils logic tests', () => {
  describe('formatCurrency', () => {
    it('formats numbers with ₹ symbol and Indian numbering separators', () => {
      expect(formatCurrency(8000)).toBe('₹8,000');
      expect(formatCurrency(120000)).toBe('₹1,20,000');
      expect(formatCurrency(0)).toBe('₹0');
      expect(formatCurrency(45.6)).toBe('₹46');
    });

    it('handles negative or missing values gracefully', () => {
      expect(formatCurrency(NaN)).toBe('₹0');
    });
  });

  describe('month navigation and formatting', () => {
    it('returns current month in YYYY-MM format', () => {
      const current = getCurrentMonth();
      expect(current).toMatch(/^\d{4}-\d{2}$/);
    });

    it('formats month for display', () => {
      expect(formatMonthDisplay('2026-09')).toBe('September 2026');
      expect(formatMonthDisplay('2025-01')).toBe('January 2025');
      expect(formatMonthDisplay('')).toBe('');
    });

    it('navigates to previous month across years', () => {
      expect(getPreviousMonth('2026-09')).toBe('2026-08');
      expect(getPreviousMonth('2026-01')).toBe('2025-12');
    });

    it('navigates to next month across years', () => {
      expect(getNextMonth('2026-09')).toBe('2026-10');
      expect(getNextMonth('2026-12')).toBe('2027-01');
    });
  });

  describe('getDaysCountInMonth', () => {
    it('returns 30 days for September, April, June, November', () => {
      expect(getDaysCountInMonth('2026-09')).toBe(30);
      expect(getDaysCountInMonth('2026-04')).toBe(30);
      expect(getDaysCountInMonth('2026-06')).toBe(30);
      expect(getDaysCountInMonth('2026-11')).toBe(30);
    });

    it('returns 31 days for January, March, July, August, etc.', () => {
      expect(getDaysCountInMonth('2026-01')).toBe(31);
      expect(getDaysCountInMonth('2026-08')).toBe(31);
      expect(getDaysCountInMonth('2026-12')).toBe(31);
    });

    it('handles February in leap year and non-leap year', () => {
      expect(getDaysCountInMonth('2024-02')).toBe(29);
      expect(getDaysCountInMonth('2025-02')).toBe(28);
    });
  });

  describe('buildCalendarDays', () => {
    it('builds calendar matrix with 7 columns grid alignment', () => {
      const days = buildCalendarDays('2026-09');
      expect(days.length % 7).toBe(0);
      expect(days.some((d) => d.dateStr === '2026-09-01')).toBe(true);
      expect(days.some((d) => d.dateStr === '2026-09-30')).toBe(true);
    });

    it('distinguishes current month days from padding days', () => {
      const days = buildCalendarDays('2026-09');
      const currentMonthDays = days.filter((d) => d.isCurrentMonth);
      expect(currentMonthDays.length).toBe(30);
    });
  });
});
