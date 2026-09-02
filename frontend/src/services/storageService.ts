import { AttendanceRecord, HouseHelp, MonthlyAdjustment } from '../types';
import { getCurrentMonth } from '../utils/dateUtils';
import { normalizeSalaryType } from '../utils/salaryCalculator';

const HELPERS_KEY = 'househelp_helpers_v1';
const ATTENDANCE_KEY = 'househelp_attendance_v1';
const ADJUSTMENTS_KEY = 'househelp_adjustments_v1';

const INITIAL_HELPERS: HouseHelp[] = [
  {
    id: 'helper-1',
    name: 'Sunita Sharma',
    role: 'Chef & Cook',
    avatarEmoji: '👩‍🍳',
    colorTheme: 'pink',
    salaryType: 'DAYS_LEAVES',
    baseSalary: 8000,
    paidLeavesAllowance: 2,
    weeklyOffDay: 0,
    phone: '+91 98765 43210',
    notes: 'Prepares lunch and dinner; specialist in North Indian dishes.',
    joinDate: '2025-01-10',
    isActive: true,
  },
  {
    id: 'helper-2',
    name: 'Ramesh Kumar',
    role: 'Personal Driver',
    avatarEmoji: '🚗',
    colorTheme: 'blue',
    salaryType: 'FIXED',
    baseSalary: 12000,
    paidLeavesAllowance: 0,
    weeklyOffDay: -1,
    phone: '+91 98123 45678',
    notes: 'Handles school pickups and grocery runs.',
    joinDate: '2025-03-01',
    isActive: true,
  },
  {
    id: 'helper-3',
    name: 'Pinky Devi',
    role: 'Ironing & Laundry',
    avatarEmoji: '🧺',
    colorTheme: 'purple',
    salaryType: 'COUNT_BASED',
    baseSalary: 20,
    ratePerItem: 20,
    itemUnitName: 'clothes',
    paidLeavesAllowance: 0,
    weeklyOffDay: -1,
    phone: '+91 98989 12345',
    notes: 'Pressing clothes and laundry loads.',
    joinDate: '2024-11-15',
    isActive: true,
  },
];

function generateInitialAttendance(): AttendanceRecord[] {
  const currentMonth = getCurrentMonth();
  const records: AttendanceRecord[] = [
    {
      id: `rec-1`,
      helperId: 'helper-1',
      date: `${currentMonth}-04`,
      status: 'FULL_LEAVE',
      note: 'Family function in hometown',
      updatedAt: new Date().toISOString(),
    },
    {
      id: `rec-2`,
      helperId: 'helper-1',
      date: `${currentMonth}-12`,
      status: 'HALF_LEAVE',
      note: 'Doctor appointment morning',
      updatedAt: new Date().toISOString(),
    },
    {
      id: `rec-3`,
      helperId: 'helper-3',
      date: `${currentMonth}-03`,
      itemCount: 15,
      note: 'Shirts & kurtas',
      updatedAt: new Date().toISOString(),
    },
    {
      id: `rec-4`,
      helperId: 'helper-3',
      date: `${currentMonth}-07`,
      itemCount: 22,
      note: 'Bed linens & pants',
      updatedAt: new Date().toISOString(),
    },
    {
      id: `rec-5`,
      helperId: 'helper-3',
      date: `${currentMonth}-14`,
      itemCount: 18,
      note: 'Formals & school dresses',
      updatedAt: new Date().toISOString(),
    },
    {
      id: `rec-6`,
      helperId: 'helper-3',
      date: `${currentMonth}-21`,
      itemCount: 25,
      note: 'Weekly laundry batch',
      updatedAt: new Date().toISOString(),
    },
    {
      id: `rec-7`,
      helperId: 'helper-3',
      date: `${currentMonth}-28`,
      itemCount: 16,
      note: 'Casual clothes',
      updatedAt: new Date().toISOString(),
    },
  ];
  return records;
}

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
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    if (!isBrowser) {
      this.helpers = [...INITIAL_HELPERS];
      this.attendance = generateInitialAttendance();
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
        this.helpers = [...INITIAL_HELPERS];
        this.saveHelpers();
      }

      const storedAttendance = localStorage.getItem(ATTENDANCE_KEY);
      if (storedAttendance) {
        this.attendance = JSON.parse(storedAttendance);
      } else {
        this.attendance = generateInitialAttendance();
        this.saveAttendance();
      }

      const storedAdjustments = localStorage.getItem(ADJUSTMENTS_KEY);
      if (storedAdjustments) {
        this.adjustments = JSON.parse(storedAdjustments);
      } else {
        this.adjustments = {};
      }
    } catch {
      this.helpers = [...INITIAL_HELPERS];
      this.attendance = generateInitialAttendance();
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
    this.attendance = this.attendance.filter(
      (a) => !(a.helperId === id && a.date.substring(0, 7) >= targetMonth)
    );
    for (const key of Object.keys(this.adjustments)) {
      const [adjHelperId, adjMonth] = key.split('_');
      if (adjHelperId === id && adjMonth >= targetMonth) {
        delete this.adjustments[key];
      }
    }
    this.saveHelpers();
    this.saveAttendance();
    this.saveAdjustments();
  }

  public restoreHelper(id: string): void {
    this.helpers = this.helpers.map((h) => {
      if (h.id === id) {
        return {
          ...h,
          isActive: true,
          leftDate: undefined,
        };
      }
      return h;
    });
    this.saveHelpers();
  }

  public hardDeleteHelper(id: string): void {
    this.helpers = this.helpers.filter((h) => h.id !== id);
    this.attendance = this.attendance.filter((a) => a.helperId !== id);
    const nextAdj: Record<string, MonthlyAdjustment> = {};
    for (const [key, adj] of Object.entries(this.adjustments)) {
      if (adj.helperId !== id) {
        nextAdj[key] = adj;
      }
    }
    this.adjustments = nextAdj;
    this.saveHelpers();
    this.saveAttendance();
    this.saveAdjustments();
  }

  public getAttendance(month?: string, helperId?: string): AttendanceRecord[] {
    if (!month && !helperId) {
      return this.attendance;
    }
    let list = this.attendance;
    if (month) {
      list = list.filter((a) => a.date.startsWith(month));
    }
    if (helperId) {
      list = list.filter((a) => a.helperId === helperId);
    }
    return list;
  }

  public setAttendance(record: Omit<AttendanceRecord, 'id' | 'updatedAt'>): void {
    const existingIndex = this.attendance.findIndex(
      (a) => a.helperId === record.helperId && a.date === record.date
    );

    const fullRecord: AttendanceRecord = {
      ...record,
      id:
        existingIndex >= 0
          ? this.attendance[existingIndex].id
          : `rec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      updatedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      const next = [...this.attendance];
      next[existingIndex] = fullRecord;
      this.attendance = next;
    } else {
      this.attendance = [...this.attendance, fullRecord];
    }

    this.saveAttendance();
  }

  public setItemCount(
    helperId: string,
    date: string,
    count: number,
    note?: string,
    customRate?: number
  ): void {
    const existingIndex = this.attendance.findIndex(
      (a) => a.helperId === helperId && a.date === date
    );

    if (count <= 0 && !note) {
      if (existingIndex >= 0) {
        this.removeAttendance(helperId, date);
      }
      return;
    }

    const fullRecord: AttendanceRecord = {
      id:
        existingIndex >= 0
          ? this.attendance[existingIndex].id
          : `rec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      helperId,
      date,
      itemCount: count,
      customRate: customRate !== undefined && customRate > 0 ? customRate : undefined,
      note: note || undefined,
      updatedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      const next = [...this.attendance];
      next[existingIndex] = fullRecord;
      this.attendance = next;
    } else {
      this.attendance = [...this.attendance, fullRecord];
    }

    this.saveAttendance();
  }

  public removeAttendance(helperId: string, date: string): void {
    this.attendance = this.attendance.filter((a) => !(a.helperId === helperId && a.date === date));
    this.saveAttendance();
  }

  public clearMonthAttendance(helperId: string, month: string): void {
    this.attendance = this.attendance.filter(
      (a) => !(a.helperId === helperId && a.date.startsWith(month))
    );
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

  public resetToDemoData(): void {
    this.helpers = [...INITIAL_HELPERS];
    this.attendance = generateInitialAttendance();
    this.adjustments = {};
    this.saveHelpers();
    this.saveAttendance();
    this.saveAdjustments();
  }

  public exportBackup(): string {
    return JSON.stringify(
      {
        version: 1,
        exportedAt: new Date().toISOString(),
        helpers: this.helpers,
        attendance: this.attendance,
        adjustments: this.adjustments,
      },
      null,
      2
    );
  }

  public importBackup(jsonStr: string): boolean {
    try {
      const data = JSON.parse(jsonStr);
      if (Array.isArray(data.helpers) && Array.isArray(data.attendance)) {
        this.helpers = data.helpers;
        this.attendance = data.attendance;
        this.adjustments = data.adjustments || {};
        this.saveHelpers();
        this.saveAttendance();
        this.saveAdjustments();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }
}

export const storageService = new StorageService();
