import { AttendanceRecord, StaffMember, SalaryAdjustment } from '@/app/staff-budget/types';
import { apiClient } from '@/data/api/client';

export const staffBudgetApi = {
  getStaff: async (includeInactive = true): Promise<StaffMember[]> => {
    const res = await apiClient.get<StaffMember[]>('/staff-budget/staff', {
      params: { includeInactive },
    });
    return Array.isArray(res.data) ? res.data : [];
  },

  saveStaff: async (staff: StaffMember): Promise<StaffMember> => {
    const res = await apiClient.post<StaffMember>('/staff-budget/staff', staff);
    return res.data;
  },

  deleteStaff: async (id: string, hard = false, leftDate?: string): Promise<void> => {
    await apiClient.delete(`/staff-budget/staff/${id}`, {
      params: { hard, leftDate },
    });
  },

  restoreStaff: async (id: string): Promise<void> => {
    await apiClient.post(`/staff-budget/staff/${id}/restore`);
  },

  getAttendance: async (month?: string, staffId?: string): Promise<AttendanceRecord[]> => {
    const res = await apiClient.get<AttendanceRecord[]>('/staff-budget/attendance', {
      params: { month, staffId },
    });
    return Array.isArray(res.data) ? res.data : [];
  },

  saveAttendance: async (record: Partial<AttendanceRecord>): Promise<AttendanceRecord> => {
    const res = await apiClient.post<AttendanceRecord>('/staff-budget/attendance', record);
    return res.data;
  },

  deleteAttendance: async (staffId: string, date: string): Promise<void> => {
    await apiClient.delete('/staff-budget/attendance', {
      params: { staffId, date },
    });
  },

  getAdjustments: async (month?: string, staffId?: string): Promise<SalaryAdjustment[]> => {
    const res = await apiClient.get<SalaryAdjustment[]>('/staff-budget/adjustments', {
      params: { month, staffId },
    });
    return Array.isArray(res.data) ? res.data : [];
  },

  saveAdjustment: async (adjustment: SalaryAdjustment): Promise<SalaryAdjustment> => {
    const res = await apiClient.post<SalaryAdjustment>('/staff-budget/adjustments', adjustment);
    return res.data;
  },
};
