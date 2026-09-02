import { AttendanceRecord, HouseHelp, MonthlyAdjustment } from '../types';
import { getCurrentMonth } from '../utils/dateUtils';

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
    salaryType: 'FIXED_MONTHLY',
    baseSalary: 8000,
    paidLeavesAllowance: 2,
    weeklyOffDay: 0, // Sunday
    phone: '+91 98765 43210',
    notes: 'Prepares lunch and dinner; specialist in North Indian dishes.',
    joinDate: '2025-01-10',
    isActive: true,
  },
  {
    id: 'helper-2',
    name: 'Ramesh Kumar',
    role: 'Driver',
    avatarEmoji: '🚗',
    colorTheme: 'blue',
    salaryType: 'DAILY_WAGE',
    baseSalary: 500, // per day
    paidLeavesAllowance: 0,
    weeklyOffDay: 0, // Sunday
    phone: '+91 98123 45678',
    notes: 'Handles school pickups and grocery runs.',
    joinDate: '2025-03-01',
    isActive: true,
  },
  {
    id: 'helper-3',
    name: 'Pinky Devi',
    role: 'Housekeeper',
    avatarEmoji: '🧹',
    colorTheme: 'purple',
    salaryType: 'FIXED_MONTHLY',
    baseSalary: 6500,
    paidLeavesAllowance: 2,
    weeklyOffDay: -1, // No fixed weekly off
    phone: '+91 98989 12345',
    notes: 'Deep cleaning, dusting, and organizing.',
    joinDate: '2024-11-15',
    isActive: true,
  },
];

function generateInitialAttendance(): AttendanceRecord[] {
  const currentMonth = getCurrentMonth();
  const records: AttendanceRecord[] = [
    // Sunita: took leave on 4th, half leave on 12th
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
    // Ramesh: took leave on 8th
    {
      id: `rec-3`,
      helperId: 'helper-2',
      date: `${currentMonth}-08`,
      status: 'FULL_LEAVE',
      note: 'Vehicle repair day',
      updatedAt: new Date().toISOString(),
    },
    // Pinky: took paid leave on 6th
    {
      id: `rec-4`,
      helperId: 'helper-3',
      date: `${currentMonth}-06`,
      status: 'PAID_LEAVE',
      note: 'Festival holiday',
      updatedAt: new Date().toISOString(),
    },
  ];
  return records;
}

// Check for window/localStorage availability
const isBrowser = typeof window !== 'undefined';

class StorageService {
  private helpers: HouseHelp[] = [];
  private attendance: AttendanceRecord[] = [];
  private adjustments: Record<string, MonthlyAdjustment> = {}; // key: `${helperId}_${month}`
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
        this.helpers = JSON.parse(storedHelpers);
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
    } catch (e) {
      console.warn('Could not read from localStorage, using in-memory data', e);
      this.helpers = [...INITIAL_HELPERS];
      this.attendance = generateInitialAttendance();
    }
  }

  private saveHelpers(): void {
    if (isBrowser) {
      try {
        localStorage.setItem(HELPERS_KEY, JSON.stringify(this.helpers));
      } catch (e) {
        console.warn('LocalStorage error:', e);
      }
    }
    this.notify();
  }

  private saveAttendance(): void {
    if (isBrowser) {
      try {
        localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(this.attendance));
      } catch (e) {
        console.warn('LocalStorage error:', e);
      }
    }
    this.notify();
  }

  private saveAdjustments(): void {
    if (isBrowser) {
      try {
        localStorage.setItem(ADJUSTMENTS_KEY, JSON.stringify(this.adjustments));
      } catch (e) {
        console.warn('LocalStorage error:', e);
      }
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

  // --- Helpers CRUD ---
  public getHelpers(): HouseHelp[] {
    return [...this.helpers];
  }

  public getHelperById(id: string): HouseHelp | undefined {
    return this.helpers.find((h) => h.id === id);
  }

  public saveHelper(helper: HouseHelp): void {
    const index = this.helpers.findIndex((h) => h.id === helper.id);
    if (index >= 0) {
      this.helpers[index] = helper;
    } else {
      this.helpers.push(helper);
    }
    this.saveHelpers();
  }

  public deleteHelper(id: string): void {
    this.helpers = this.helpers.filter((h) => h.id !== id);
    this.attendance = this.attendance.filter((a) => a.helperId !== id);
    this.saveHelpers();
    this.saveAttendance();
  }

  // --- Attendance CRUD ---
  public getAttendance(month?: string, helperId?: string): AttendanceRecord[] {
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
      id: existingIndex >= 0 ? this.attendance[existingIndex].id : `rec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      updatedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      this.attendance[existingIndex] = fullRecord;
    } else {
      this.attendance.push(fullRecord);
    }

    this.saveAttendance();
  }

  public removeAttendance(helperId: string, date: string): void {
    this.attendance = this.attendance.filter(
      (a) => !(a.helperId === helperId && a.date === date)
    );
    this.saveAttendance();
  }

  public clearMonthAttendance(helperId: string, month: string): void {
    this.attendance = this.attendance.filter(
      (a) => !(a.helperId === helperId && a.date.startsWith(month))
    );
    this.saveAttendance();
  }

  // --- Adjustments (Bonus / Advance / Paid Status) ---
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
    this.adjustments[key] = adj;
    this.saveAdjustments();
  }

  // --- Demo data & Backup ---
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
    } catch (e) {
      console.error('Import failed:', e);
      return false;
    }
  }
}

// Export singleton instance
export const storageService = new StorageService();
