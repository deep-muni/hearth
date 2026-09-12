export type MealCategory = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'sweet' | 'all';

export interface MealSlotConfig {
  id: string;
  name: string;
  iconEmoji: string;
  defaultTime?: string;
  isEnabled: boolean;
  order: number;
}

export interface MealSlot {
  id: string;
  slotConfigId?: string;
  name: string;
  icon: string;
  items: string[];
  note?: string;
  tags?: string[];
  cookStaffId?: string;
  isCompleted?: boolean;
}

export interface DayMenu {
  id: string;
  date: string;
  slots: MealSlot[];
  note?: string;
  updatedAt: string;
}

export interface DishSuggestion {
  id: string;
  name: string;
  category: MealCategory;
  isVeg: boolean;
  tags: string[];
  defaultSlotName?: string;
}

export interface WeekMenuSummary {
  weekStartDate: string;
  weekEndDate: string;
  totalMealsPlanned: number;
  totalDaysWithPlan: number;
  vegMealsCount: number;
  nonVegMealsCount: number;
}

export interface DayRoutineTemplate {
  dayOfWeek: number;
  dayName: string;
  slots: MealSlot[];
  note?: string;
}

export type WeeklyRoutine = Record<number, DayRoutineTemplate>;

export interface LibraryDish {
  id?: string;
  name: string;
  slots: string[];
  totalUses: number;
  slotUses: Record<string, number>;
}

export interface UndoState {
  text: string;
  restore: () => Promise<void>;
}

export type ModalKind = 'share' | 'setup' | null;
export type SetupTab = 'routine' | 'slots' | 'dishes';
export type ShareScope = 'week' | 'today';
