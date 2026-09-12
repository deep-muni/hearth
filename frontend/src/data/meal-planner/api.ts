import { apiClient } from '@/data/api/client';
import { DayMenu, DishSuggestion, MealSlotConfig, WeeklyRoutine } from '@/app/meal-planner/types';

export const mealPlannerApi = {
  getMeals: async (startDate?: string, endDate?: string): Promise<DayMenu[]> => {
    const params: Record<string, string> = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const res = await apiClient.get<DayMenu[]>('/meals', { params });
    return res.data || [];
  },

  getMealByDate: async (date: string): Promise<DayMenu | null> => {
    const res = await apiClient.get<DayMenu | null>('/meals', { params: { date } });
    return res.data;
  },

  saveMeal: async (menu: DayMenu): Promise<DayMenu> => {
    const res = await apiClient.post<DayMenu>('/meals', menu);
    return res.data;
  },

  deleteMeal: async (date: string): Promise<void> => {
    await apiClient.delete(`/meals/${date}`);
  },

  getDishes: async (): Promise<DishSuggestion[]> => {
    const res = await apiClient.get<DishSuggestion[]>('/meals/dishes');
    return res.data || [];
  },

  saveDish: async (dish: DishSuggestion): Promise<DishSuggestion> => {
    const res = await apiClient.post<DishSuggestion>('/meals/dishes', dish);
    return res.data;
  },

  deleteDish: async (id: string): Promise<void> => {
    await apiClient.delete(`/meals/dishes/${id}`);
  },

  getRoutine: async (): Promise<WeeklyRoutine> => {
    const res = await apiClient.get<WeeklyRoutine>('/meals/routine');
    return res.data || {};
  },

  saveRoutine: async (routine: WeeklyRoutine): Promise<void> => {
    await apiClient.post('/meals/routine', routine);
  },

  getSlots: async (): Promise<MealSlotConfig[]> => {
    const res = await apiClient.get<MealSlotConfig[]>('/meals/slots');
    return res.data || [];
  },

  saveSlots: async (slots: MealSlotConfig[]): Promise<void> => {
    await apiClient.post('/meals/slots', slots);
  },
};
