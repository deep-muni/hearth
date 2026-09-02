import { describe, it, expect, beforeEach } from 'vitest';
import { storageService } from '../storageService';
import { HouseHelp } from '../../types';

describe('storageService logic tests', () => {
  beforeEach(() => {
    localStorage.clear();
    storageService.resetToDemoData();
  });

  describe('staff lifecycle and historical data preservation', () => {
    it('saves new staff member with isActive true', () => {
      const newHelper: HouseHelp = {
        id: 'helper-gardener',
        name: 'Mahesh',
        role: 'Gardener',
        avatarEmoji: '🌱',
        colorTheme: 'emerald',
        salaryType: 'FIXED',
        baseSalary: 4000,
        paidLeavesAllowance: 0,
        weeklyOffDay: -1,
        joinDate: '2026-09-01',
        isActive: true,
      };

      storageService.saveHelper(newHelper);
      const retrieved = storageService.getHelperById('helper-gardener');
      expect(retrieved).toBeDefined();
      expect(retrieved?.name).toBe('Mahesh');
      expect(retrieved?.isActive).toBe(true);
    });

    it('soft deletes staff for target month while preserving past attendance and payments', () => {
      // 1. Setup past records in August (2026-08)
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
        paidOn: 'Aug 31',
      });

      // 2. Setup current record in September (2026-09)
      storageService.setAttendance({
        helperId: 'helper-1',
        date: '2026-09-02',
        status: 'PRESENT',
      });

      storageService.saveAdjustment({
        helperId: 'helper-1',
        month: '2026-09',
        bonus: 0,
        advanceDeduction: 0,
        isPaid: false,
      });

      // 3. Remove staff in September (2026-09)
      storageService.deleteHelper('helper-1', '2026-09');

      // 4. Verify helper metadata
      const helper = storageService.getHelperById('helper-1');
      expect(helper?.isActive).toBe(false);
      expect(helper?.leftDate).toBe('2026-09');

      // 5. Verify September records are cleared
      const sepAttendance = storageService.getAttendance('2026-09', 'helper-1');
      expect(sepAttendance.length).toBe(0);

      // 6. CRITICAL: Verify August records and adjustments remain 100% intact!
      const augAttendance = storageService.getAttendance('2026-08', 'helper-1');
      expect(augAttendance.length).toBe(1);
      expect(augAttendance[0].date).toBe('2026-08-10');

      const augAdjustment = storageService.getAdjustment('helper-1', '2026-08');
      expect(augAdjustment.isPaid).toBe(true);
      expect(augAdjustment.bonus).toBe(500);
    });

    it('restores soft-deleted staff back to active state', () => {
      storageService.deleteHelper('helper-1', '2026-09');
      expect(storageService.getHelperById('helper-1')?.isActive).toBe(false);

      storageService.restoreHelper('helper-1');
      const restored = storageService.getHelperById('helper-1');
      expect(restored?.isActive).toBe(true);
      expect(restored?.leftDate).toBeUndefined();
    });

    it('permanently hard deletes staff and cascades across all data', () => {
      storageService.hardDeleteHelper('helper-1');
      expect(storageService.getHelperById('helper-1')).toBeUndefined();

      const allAttendance = storageService.getAttendance(undefined, 'helper-1');
      expect(allAttendance.length).toBe(0);
    });
  });

  describe('attendance and count logging', () => {
    it('sets and removes attendance record', () => {
      storageService.setAttendance({
        helperId: 'helper-1',
        date: '2026-09-15',
        status: 'FULL_LEAVE',
        note: 'Medical checkup',
      });

      let records = storageService.getAttendance('2026-09', 'helper-1');
      const record = records.find((r) => r.date === '2026-09-15');
      expect(record).toBeDefined();
      expect(record?.status).toBe('FULL_LEAVE');
      expect(record?.note).toBe('Medical checkup');

      storageService.removeAttendance('helper-1', '2026-09-15');
      records = storageService.getAttendance('2026-09', 'helper-1');
      expect(records.find((r) => r.date === '2026-09-15')).toBeUndefined();
    });

    it('logs item counts with custom rate and note for count-based staff', () => {
      storageService.setItemCount('helper-3', '2026-09-10', 12, 'Heavy blankets', 40);

      const records = storageService.getAttendance('2026-09', 'helper-3');
      const record = records.find((r) => r.date === '2026-09-10');
      expect(record).toBeDefined();
      expect(record?.itemCount).toBe(12);
      expect(record?.customRate).toBe(40);
      expect(record?.note).toBe('Heavy blankets');
    });

    it('removes record when item count is 0 and no note is provided', () => {
      storageService.setItemCount('helper-3', '2026-09-10', 5);
      expect(storageService.getAttendance('2026-09', 'helper-3').length).toBeGreaterThan(0);

      storageService.setItemCount('helper-3', '2026-09-10', 0);
      const records = storageService.getAttendance('2026-09', 'helper-3');
      expect(records.find((r) => r.date === '2026-09-10')).toBeUndefined();
    });
  });

  describe('backup export and import', () => {
    it('exports and imports backup JSON correctly', () => {
      const backupJson = storageService.exportBackup();
      expect(typeof backupJson).toBe('string');
      expect(backupJson).toContain('"version": 1');

      const importSuccess = storageService.importBackup(backupJson);
      expect(importSuccess).toBe(true);
    });

    it('rejects invalid JSON backup payload', () => {
      const success = storageService.importBackup('{ "invalid": true }');
      expect(success).toBe(false);
    });
  });
});
