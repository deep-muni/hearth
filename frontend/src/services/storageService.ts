import { AttendanceRecord, HouseHelp, MonthlyAdjustment } from '../types';
import { getCurrentMonth } from '../utils/dateUtils';
import { normalizeSalaryType } from '../utils/salaryCalculator';

const HELPERS_KEY = 'househelp_helpers_v1';
const ATTENDANCE_KEY = 'househelp_attendance_v1';
const ADJUSTMENTS_KEY = 'househelp_adjustments_v1';

export const EMPTY_HELPERS: HouseHelp[] = [];
export const EMPTY_ATTENDANCE: AttendanceRecord[] = [];
export const EMPTY_ADJUSTMENTS: Record<string, MonthlyAdjustment> = {};

const isBrowser = typeof window !== 'undefined';

class StorageService {
  private helpers: HouseHelp[] = [];
  private attendance: AttendanceRecord[] = [];
  private adjustments: Record<string, MonthlyAdjustment> = {};
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.init();
  }

  private init(): void {
    if (!isBrowser) {
      this.helpers = [];
      this.attendance = [];
      this.adjustments = {};
      return;
    }

    try {
      const storedHelpers = localStorage.getItem(HELPERS_KEY);
      if (storedHelpers) {
        const parsed: HouseHelp[] = JSON.parse(storedHelpers);
        this.helpers = parsed.map((h) => ({
          ...h,
          salaryType: normalizeSalaryType(h.salaryType),
          ratePerItem: h.ratePerItem ?? (h.salaryType === 'COUNT_BASED' ? h.baseSalary : undefined),
          itemUnitName: h.itemUnitName ?? (h.salaryType === 'COUNT_BASED' ? 'items' : undefined),
        }));
      } else {
        this.helpers = [];
      }

      const storedAttendance = localStorage.getItem(ATTENDANCE_KEY);
      if (storedAttendance) {
        this.attendance = JSON.parse(storedAttendance);
      } else {
        this.attendance = [];
      }

      const storedAdjustments = localStorage.getItem(ADJUSTMENTS_KEY);
      if (storedAdjustments) {
        this.adjustments = JSON.parse(storedAdjustments);
      } else {
        this.adjustments = {};
      }
    } catch {
      this.helpers = [];
      this.attendance = [];
      this.adjustments = {};
    }
  }

  private saveHelpers(): void {
    if (isBrowser) {
      try {
        localStorage.setItem(HELPERS_KEY, JSON.stringify(this.helpers));
      } catch {}
    }
    this.notify();
  }

  private saveAttendance(): void {
    if (isBrowser) {
      try {
        localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(this.attendance));
      } catch {}
    }
    this.notify();
  }

  private saveAdjustments(): void {
    if (isBrowser) {
      try {
        localStorage.setItem(ADJUSTMENTS_KEY, JSON.stringify(this.adjustments));
      } catch {}
    }
    this.notify();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    this.listeners.forEach((l) => l());
  }

  public getHelpers(): HouseHelp[] {
    return this.helpers;
  }

  public getHelperById(id: string): HouseHelp | undefined {
    return this.helpers.find((h) => h.id === id);
  }

  public saveHelper(helper: HouseHelp): void {
    const index = this.helpers.findIndex((h) => h.id === helper.id);
    if (index >= 0) {
      const next = [...this.helpers];
      next[index] = helper;
      this.helpers = next;
    } else {
      this.helpers = [...this.helpers, helper];
    }
    this.saveHelpers();
  }

  public deleteHelper(id: string, effectiveMonth?: string): void {
    const targetMonth = effectiveMonth || getCurrentMonth();
    this.helpers = this.helpers.map((h) => {
      if (h.id === id) {
        return {
          ...h,
          isActive: false,
          leftDate: targetMonth,
        };
      }
      return h;
    });
    this.saveHelpers();
  }

  public restoreHelper(id: string): void {
    this.helpers = this.helpers.map((h) => {
      if (h.id === id) {
        const copy = { ...h, isActive: true };
        delete copy.leftDate;
        return copy;
      }
      return h;
    });
    this.saveHelpers();
  }

  public hardDeleteHelper(id: string): void {
    this.helpers = this.helpers.filter((h) => h.id !== id);
    this.attendance = this.attendance.filter((a) => a.helperId !== id);
    const updatedAdjustments: Record<string, MonthlyAdjustment> = {};
    for (const [k, v] of Object.entries(this.adjustments)) {
      if (v.helperId !== id) {
        updatedAdjustments[k] = v;
      }
    }
    this.adjustments = updatedAdjustments;

    this.saveHelpers();
    this.saveAttendance();
    this.saveAdjustments();
  }

  public getAttendance(): AttendanceRecord[] {
    return this.attendance;
  }

  public setAttendance(params: {
    helperId: string;
    date: string;
    status: AttendanceRecord['status'];
    note?: string;
  }): void {
    const existingIndex = this.attendance.findIndex(
      (a) => a.helperId === params.helperId && a.date === params.date
    );

    const record: AttendanceRecord = {
      id:
        existingIndex >= 0
          ? this.attendance[existingIndex].id
          : `att-${Date.now()}-${Math.random()}`,
      helperId: params.helperId,
      date: params.date,
      status: params.status,
      note: params.note,
      updatedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      const next = [...this.attendance];
      next[existingIndex] = {
        ...next[existingIndex],
        ...record,
        itemCount: undefined,
        customRate: undefined,
      };
      this.attendance = next;
    } else {
      this.attendance = [...this.attendance, record];
    }

    this.saveAttendance();
  }

  public setItemCount(
    helperId: string,
    date: string,
    itemCount: number,
    note?: string,
    customRate?: number
  ): void {
    const existingIndex = this.attendance.findIndex(
      (a) => a.helperId === helperId && a.date === date
    );

    const record: AttendanceRecord = {
      id:
        existingIndex >= 0
          ? this.attendance[existingIndex].id
          : `att-${Date.now()}-${Math.random()}`,
      helperId,
      date,
      status: 'PRESENT',
      itemCount,
      customRate,
      note,
      updatedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      const next = [...this.attendance];
      next[existingIndex] = {
        ...next[existingIndex],
        ...record,
      };
      this.attendance = next;
    } else {
      this.attendance = [...this.attendance, record];
    }

    this.saveAttendance();
  }

  public removeAttendance(helperId: string, date: string): void {
    this.attendance = this.attendance.filter((a) => !(a.helperId === helperId && a.date === date));
    this.saveAttendance();
  }

  public getAdjustments(): Record<string, MonthlyAdjustment> {
    return this.adjustments;
  }

  public getAdjustment(helperId: string, month: string): MonthlyAdjustment {
    const key = `${helperId}_${month}`;
    return (
      this.adjustments[key] || {
        helperId,
        month,
        bonus: 0,
        advanceDeduction: 0,
        isPaid: false,
      }
    );
  }

  public saveAdjustment(adj: MonthlyAdjustment): void {
    const key = `${adj.helperId}_${adj.month}`;
    this.adjustments = { ...this.adjustments, [key]: adj };
    this.saveAdjustments();
  }
}

export const storageService = new StorageService();
