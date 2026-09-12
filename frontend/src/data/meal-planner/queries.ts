import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DayMenu, DishSuggestion, MealSlotConfig, WeeklyRoutine } from '@/app/meal-planner/types';
import { mealPlannerApi } from './api';

const mealQueryKeys = {
  all: ['mealPlanner'] as const,
  meals: {
    all: ['mealPlanner', 'meals'] as const,
    range: (startDate?: string, endDate?: string) =>
      ['mealPlanner', 'meals', 'range', { startDate, endDate }] as const,
    byDate: (date: string) => ['mealPlanner', 'meals', 'byDate', date] as const,
  },
  dishes: {
    all: ['mealPlanner', 'dishes'] as const,
  },
  routine: {
    all: ['mealPlanner', 'routine'] as const,
  },
  slots: {
    all: ['mealPlanner', 'slots'] as const,
  },
};

export function useGetMeals(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: mealQueryKeys.meals.range(startDate, endDate),
    queryFn: () => mealPlannerApi.getMeals(startDate, endDate),
  });
}

export function useSaveMeal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (menu: DayMenu) => mealPlannerApi.saveMeal(menu),
    onSuccess: (savedMenu) => {
      queryClient.invalidateQueries({ queryKey: mealQueryKeys.meals.all });
      if (savedMenu?.date) {
        queryClient.invalidateQueries({
          queryKey: mealQueryKeys.meals.byDate(savedMenu.date),
        });
      }
    },
  });
}

export function useDeleteMeal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (date: string) => mealPlannerApi.deleteMeal(date),
    onSuccess: (_data, date) => {
      queryClient.invalidateQueries({ queryKey: mealQueryKeys.meals.all });
      queryClient.invalidateQueries({ queryKey: mealQueryKeys.meals.byDate(date) });
    },
  });
}

export function useGetDishes() {
  return useQuery({
    queryKey: mealQueryKeys.dishes.all,
    queryFn: () => mealPlannerApi.getDishes(),
  });
}

export function useSaveDish() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dish: DishSuggestion) => mealPlannerApi.saveDish(dish),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mealQueryKeys.dishes.all });
    },
  });
}

export function useDeleteDish() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => mealPlannerApi.deleteDish(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mealQueryKeys.dishes.all });
    },
  });
}

export function useGetWeeklyRoutine() {
  return useQuery({
    queryKey: mealQueryKeys.routine.all,
    queryFn: () => mealPlannerApi.getRoutine(),
  });
}

export function useSaveWeeklyRoutine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (routine: WeeklyRoutine) => mealPlannerApi.saveRoutine(routine),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mealQueryKeys.routine.all });
      queryClient.invalidateQueries({ queryKey: mealQueryKeys.meals.all });
    },
  });
}

export function useGetSlotConfigs() {
  return useQuery({
    queryKey: mealQueryKeys.slots.all,
    queryFn: () => mealPlannerApi.getSlots(),
  });
}

export function useSaveSlotConfigs() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (slots: MealSlotConfig[]) => mealPlannerApi.saveSlots(slots),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mealQueryKeys.slots.all });
      queryClient.invalidateQueries({ queryKey: mealQueryKeys.meals.all });
    },
  });
}
