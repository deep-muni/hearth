import { describe, it, expect } from 'vitest';
import { isHelperActiveInMonth } from '../useHouseHelp';
import { HouseHelp, AttendanceRecord, MonthlyAdjustment } from '../../types';

describe('isHelperActiveInMonth logic tests', () => {
  const sampleHelper: HouseHelp = {
    id: 'helper-1',
    name: 'Sunita',
    role: 'Cook',
    avatarEmoji: '👩‍🍳',
    colorTheme: 'pink',
    salaryType: 'DAYS_LEAVES',
    baseSalary: 8000,
    paidLeavesAllowance: 2,
    weeklyOffDay: 0,
    joinDate: '2025-01-10',
    isActive: true,
  };

  it('includes active helper when viewing month after joinDate', () => {
    const isActive = isHelperActiveInMonth(sampleHelper, '2026-08', [], {});
    expect(isActive).toBe(true);
  });

  it('excludes helper when viewing month before joinDate', () => {
    const isActive = isHelperActiveInMonth(sampleHelper, '2024-12', [], {});
    expect(isActive).toBe(false);
  });

  it('includes helper before joinDate if they have explicit attendance records', () => {
    const records: AttendanceRecord[] = [
      {
        id: 'rec-early',
        helperId: 'helper-1',
        date: '2024-12-28',
        status: 'PRESENT',
        updatedAt: '',
      },
    ];
    const isActive = isHelperActiveInMonth(sampleHelper, '2024-12', records, {});
    expect(isActive).toBe(true);
  });

  it('keeps helper visible in past months when removed in a later month', () => {
    const removedHelper: HouseHelp = {
      ...sampleHelper,
      isActive: false,
      leftDate: '2026-09',
    };

    // In August (month before removal): MUST BE VISIBLE!
    const inAugust = isHelperActiveInMonth(removedHelper, '2026-08', [], {});
    expect(inAugust).toBe(true);

    // In September (removal month): MUST BE EXCLUDED!
    const inSeptember = isHelperActiveInMonth(removedHelper, '2026-09', [], {});
    expect(inSeptember).toBe(false);

    // In October (future month): MUST BE EXCLUDED!
    const inOctober = isHelperActiveInMonth(removedHelper, '2026-10', [], {});
    expect(inOctober).toBe(false);
  });

  it('includes helper in month if they have paid adjustments even if inactive', () => {
    const inactiveHelper: HouseHelp = {
      ...sampleHelper,
      isActive: false,
    };

    const adjustments: Record<string, MonthlyAdjustment> = {
      'helper-1_2026-08': {
        helperId: 'helper-1',
        month: '2026-08',
        bonus: 0,
        advanceDeduction: 0,
        isPaid: true,
      },
    };

    const inAugust = isHelperActiveInMonth(inactiveHelper, '2026-08', [], adjustments);
    expect(inAugust).toBe(true);
  });
});
