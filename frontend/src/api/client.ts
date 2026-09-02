import { AttendanceRecord, HouseHelp, MonthlyAdjustment } from '@/types';
import { storageService } from '@/services/storageService';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => 'Request failed');
    throw new Error(errorText || `HTTP ${res.status}`);
  }

  if (res.status === 204) {
    return null as unknown as T;
  }

  return res.json();
}

export const apiClient = {
  getHelpers: async (includeInactive = true): Promise<HouseHelp[]> => {
    try {
      return await request<HouseHelp[]>(`/helpers?includeInactive=${includeInactive}`);
    } catch {
      const all = storageService.getHelpers();
      return includeInactive ? all : all.filter((h) => h.isActive);
    }
  },

  saveHelper: async (helper: HouseHelp): Promise<HouseHelp> => {
    try {
      return await request<HouseHelp>('/helpers', {
        method: 'POST',
        body: JSON.stringify(helper),
      });
    } catch {
      storageService.saveHelper(helper);
      return helper;
    }
  },

  deleteHelper: async (id: string, hard = false, leftDate?: string): Promise<void> => {
    try {
      await request<void>(
        `/helpers/${id}?hard=${hard}${leftDate ? `&leftDate=${encodeURIComponent(leftDate)}` : ''}`,
        {
          method: 'DELETE',
        }
      );
    } catch {
      if (hard) {
        storageService.hardDeleteHelper(id);
      } else {
        storageService.deleteHelper(id, leftDate);
      }
    }
  },

  restoreHelper: async (id: string): Promise<void> => {
    try {
      await request<void>(`/helpers/${id}/restore`, {
        method: 'POST',
      });
    } catch {
      storageService.restoreHelper(id);
    }
  },

  getAttendance: async (month?: string, helperId?: string): Promise<AttendanceRecord[]> => {
    try {
      const params = new URLSearchParams();
      if (month) params.append('month', month);
      if (helperId) params.append('helperId', helperId);
      const qs = params.toString();
      return await request<AttendanceRecord[]>(`/attendance${qs ? `?${qs}` : ''}`);
    } catch {
      let records = storageService.getAttendance();
      if (month) {
        records = records.filter((r) => r.date.startsWith(month));
      }
      if (helperId) {
        records = records.filter((r) => r.helperId === helperId);
      }
      return records;
    }
  },

  saveAttendance: async (record: Partial<AttendanceRecord>): Promise<AttendanceRecord> => {
    try {
      return await request<AttendanceRecord>('/attendance', {
        method: 'POST',
        body: JSON.stringify(record),
      });
    } catch {
      if (record.itemCount !== undefined) {
        storageService.setItemCount(
          record.helperId!,
          record.date!,
          record.itemCount,
          record.note,
          record.customRate
        );
      } else {
        storageService.setAttendance({
          helperId: record.helperId!,
          date: record.date!,
          status: record.status || 'PRESENT',
          note: record.note,
        });
      }
      return {
        id: record.id || `att_${Date.now()}`,
        helperId: record.helperId!,
        date: record.date!,
        status: record.status,
        itemCount: record.itemCount,
        customRate: record.customRate,
        note: record.note,
        updatedAt: new Date().toISOString(),
      };
    }
  },

  deleteAttendance: async (helperId: string, date: string): Promise<void> => {
    try {
      await request<void>(
        `/attendance?helperId=${encodeURIComponent(helperId)}&date=${encodeURIComponent(date)}`,
        {
          method: 'DELETE',
        }
      );
    } catch {
      storageService.removeAttendance(helperId, date);
    }
  },

  getAdjustments: async (month?: string, helperId?: string): Promise<MonthlyAdjustment[]> => {
    try {
      const params = new URLSearchParams();
      if (month) params.append('month', month);
      if (helperId) params.append('helperId', helperId);
      const qs = params.toString();
      return await request<MonthlyAdjustment[]>(`/adjustments${qs ? `?${qs}` : ''}`);
    } catch {
      const all = Object.values(storageService.getAdjustments());
      return all.filter((a) => {
        if (month && a.month !== month) return false;
        if (helperId && a.helperId !== helperId) return false;
        return true;
      });
    }
  },

  saveAdjustment: async (adjustment: MonthlyAdjustment): Promise<MonthlyAdjustment> => {
    try {
      return await request<MonthlyAdjustment>('/adjustments', {
        method: 'POST',
        body: JSON.stringify(adjustment),
      });
    } catch {
      storageService.saveAdjustment(adjustment);
      return adjustment;
    }
  },
};
