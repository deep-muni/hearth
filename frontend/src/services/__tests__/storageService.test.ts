import { describe, it, expect, beforeEach } from 'vitest';
import { storageService } from '../storageService';
import { HouseHelp } from '../../types';

describe('storageService logic tests', () => {
  const testHelper: HouseHelp = {
    id: 'helper-1',
    name: 'Sunita Sharma',
    role: 'Cook',
    avatarEmoji: '👩‍🍳',
    colorTheme: 'rose',
    salaryType: 'DAYS_LEAVES',
    baseSalary: 4500,
    paidLeavesAllowance: 2,
    weeklyOffDay: 0,
    isActive: true,
  };

  beforeEach(() => {
    localStorage.clear();
    const helpers = storageService.getHelpers();
    for (const h of helpers) {
      storageService.hardDeleteHelper(h.id);
    }
  });

  describe('fresh start', () => {
    it('starts with empty helpers array', () => {
      expect(storageService.getHelpers()).toEqual([]);
      expect(storageService.getAttendance()).toEqual([]);
    });
  });

  describe('staff lifecycle and data preservation', () => {
    it('saves new staff member with isActive true', () => {
      storageService.saveHelper(testHelper);
      const retrieved = storageService.getHelperById('helper-1');
      expect(retrieved).toBeDefined();
      expect(retrieved?.name).toBe('Sunita Sharma');
      expect(retrieved?.isActive).toBe(true);
    });

    it('soft deletes staff while preserving past attendance and payments', () => {
      storageService.saveHelper(testHelper);

      storageService.setAttendance({
        helperId: 'helper-1',
        date: '2026-08-10',
        status: 'FULL_LEAVE',
      });

      storageService.saveAdjustment({
        helperId: 'helper-1',
        month: '2026-08',
        bonus: 500,
        advanceDeduction: 0,
        isPaid: true,
      });

      storageService.deleteHelper('helper-1', '2026-09');

      const helper = storageService.getHelperById('helper-1');
      expect(helper?.isActive).toBe(false);
      expect(helper?.leftDate).toBe('2026-09');

      const augAttendance = storageService
        .getAttendance()
        .filter((a) => a.helperId === 'helper-1' && a.date.startsWith('2026-08'));
      expect(augAttendance.length).toBe(1);

      const augAdjustment = storageService.getAdjustment('helper-1', '2026-08');
      expect(augAdjustment.isPaid).toBe(true);
      expect(augAdjustment.bonus).toBe(500);
    });

    it('restores soft-deleted staff back to active state', () => {
      storageService.saveHelper(testHelper);
      storageService.deleteHelper('helper-1', '2026-09');
      expect(storageService.getHelperById('helper-1')?.isActive).toBe(false);

      storageService.restoreHelper('helper-1');
      const restored = storageService.getHelperById('helper-1');
      expect(restored?.isActive).toBe(true);
      expect(restored?.leftDate).toBeUndefined();
    });

    it('permanently hard deletes staff and cascades across all data', () => {
      storageService.saveHelper(testHelper);
      storageService.setAttendance({
        helperId: 'helper-1',
        date: '2026-09-01',
        status: 'PRESENT',
      });

      storageService.hardDeleteHelper('helper-1');
      expect(storageService.getHelperById('helper-1')).toBeUndefined();
      expect(storageService.getAttendance().filter((a) => a.helperId === 'helper-1').length).toBe(
        0
      );
    });
  });

  describe('attendance and count logging', () => {
    it('sets and removes attendance record', () => {
      storageService.saveHelper(testHelper);
      storageService.setAttendance({
        helperId: 'helper-1',
        date: '2026-09-15',
        status: 'FULL_LEAVE',
        note: 'Medical checkup',
      });

      let records = storageService.getAttendance().filter((a) => a.helperId === 'helper-1');
      const record = records.find((r) => r.date === '2026-09-15');
      expect(record).toBeDefined();
      expect(record?.status).toBe('FULL_LEAVE');
      expect(record?.note).toBe('Medical checkup');

      storageService.removeAttendance('helper-1', '2026-09-15');
      records = storageService.getAttendance().filter((a) => a.helperId === 'helper-1');
      expect(records.find((r) => r.date === '2026-09-15')).toBeUndefined();
    });

    it('logs item counts with custom rate and note', () => {
      storageService.saveHelper(testHelper);
      storageService.setItemCount('helper-1', '2026-09-10', 12, 'Heavy blankets', 40);

      const records = storageService.getAttendance().filter((a) => a.helperId === 'helper-1');
      const record = records.find((r) => r.date === '2026-09-10');
      expect(record).toBeDefined();
      expect(record?.itemCount).toBe(12);
      expect(record?.customRate).toBe(40);
      expect(record?.note).toBe('Heavy blankets');
    });
  });
});
