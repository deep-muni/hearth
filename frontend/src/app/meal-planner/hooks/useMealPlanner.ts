'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  DayMenu,
  DishSuggestion,
  MealSlot,
  MealSlotConfig,
  WeekMenuSummary,
  WeeklyRoutine,
} from '@/app/meal-planner/types';
import {
  useGetMeals,
  useGetDishes,
  useGetWeeklyRoutine,
  useGetSlotConfigs,
  useSaveMeal,
  useDeleteMeal,
  useSaveDish,
  useDeleteDish,
  useSaveWeeklyRoutine,
  useSaveSlotConfigs,
} from '@/data/meal-planner/queries';
import { mealPlannerApi } from '@/data/meal-planner/api';

import {
  calculateWeekMenuSummary,
  generateMenuFromRoutine,
} from '@/app/meal-planner/utils/mealFormatters';
import {
  getWeekStartDate,
  getPreviousWeek,
  getNextWeek,
  getDaysInWeek,
  formatDateToISO,
} from '@/utils/dateUtils';

export function useMealPlanner() {
  const [currentWeekStart, setCurrentWeekStart] = useState<string>(() => getWeekStartDate());
  const todayStr = useMemo(() => formatDateToISO(new Date()), []);
  const [selectedDate, setSelectedDate] = useState<string>(() => todayStr);

  const weekDays = useMemo(() => {
    return getDaysInWeek(currentWeekStart);
  }, [currentWeekStart]);

  const currentActiveWeekStart = useMemo(() => getWeekStartDate(), []);
  const isPastWeek = currentWeekStart < currentActiveWeekStart;
  const isCurrentWeek = currentWeekStart === currentActiveWeekStart;
  const isFutureWeek = currentWeekStart > currentActiveWeekStart;
  const isEditable = !isPastWeek;

  const weekStartDate = weekDays[0].dateStr;
  const weekEndDate = weekDays[6].dateStr;

  const { data: rawMeals = [], isLoading: isMealsLoading } = useGetMeals(
    weekStartDate,
    weekEndDate
  );
  const { data: rawDishes = [], isLoading: isDishesLoading } = useGetDishes();
  const { data: rawRoutine = {}, isLoading: isRoutineLoading } = useGetWeeklyRoutine();
  const { data: rawSlots = [], isLoading: isSlotsLoading } = useGetSlotConfigs();

  const saveMealMutation = useSaveMeal();
  const deleteMealMutation = useDeleteMeal();
  const saveDishMutation = useSaveDish();
  const deleteDishMutation = useDeleteDish();
  const saveRoutineMutation = useSaveWeeklyRoutine();
  const saveSlotsMutation = useSaveSlotConfigs();

  const slotConfigs: MealSlotConfig[] = useMemo(() => rawSlots || [], [rawSlots]);

  const dishes: DishSuggestion[] = useMemo(() => {
    return rawDishes || [];
  }, [rawDishes]);

  const weeklyRoutine: WeeklyRoutine = useMemo(() => {
    return rawRoutine || {};
  }, [rawRoutine]);

  const dbMenusMap = useMemo(() => {
    const map: Record<string, DayMenu> = {};
    rawMeals.forEach((m) => {
      map[m.date] = m;
    });
    return map;
  }, [rawMeals]);

  const editedDates = useMemo(() => new Set(Object.keys(dbMenusMap)), [dbMenusMap]);

  const getDayMenu = useCallback(
    (dateStr: string): DayMenu => {
      if (dbMenusMap[dateStr]) {
        return dbMenusMap[dateStr];
      }
      // Past weeks maintain history: if no meal was recorded, do not synthesize current slots
      if (isPastWeek) {
        return {
          id: `menu-${dateStr}`,
          date: dateStr,
          slots: [],
          updatedAt: new Date().toISOString(),
        };
      }
      return generateMenuFromRoutine(dateStr, weeklyRoutine, slotConfigs);
    },
    [dbMenusMap, isPastWeek, weeklyRoutine, slotConfigs]
  );

  const dayMenus: Record<string, DayMenu> = useMemo(() => {
    const menus: Record<string, DayMenu> = { ...dbMenusMap };
    weekDays.forEach((d) => {
      if (!menus[d.dateStr]) {
        if (isPastWeek) {
          menus[d.dateStr] = {
            id: `menu-${d.dateStr}`,
            date: d.dateStr,
            slots: [],
            updatedAt: new Date().toISOString(),
          };
        } else {
          menus[d.dateStr] = generateMenuFromRoutine(d.dateStr, weeklyRoutine, slotConfigs);
        }
      }
    });
    return menus;
  }, [dbMenusMap, isPastWeek, weekDays, weeklyRoutine, slotConfigs]);

  const weekSummary: WeekMenuSummary = useMemo(() => {
    return calculateWeekMenuSummary(currentWeekStart, dayMenus);
  }, [currentWeekStart, dayMenus]);

  const todayMenu = useMemo(() => {
    return getDayMenu(todayStr);
  }, [todayStr, getDayMenu]);

  const selectedDayMenu = useMemo(() => {
    return getDayMenu(selectedDate);
  }, [selectedDate, getDayMenu]);

  const goToPreviousWeek = useCallback(() => {
    setCurrentWeekStart((prev) => {
      const newWeek = getPreviousWeek(prev);
      const days = getDaysInWeek(newWeek);
      setSelectedDate(days[0].dateStr);
      return newWeek;
    });
  }, []);

  const goToNextWeek = useCallback(() => {
    setCurrentWeekStart((prev) => {
      const newWeek = getNextWeek(prev);
      const days = getDaysInWeek(newWeek);
      setSelectedDate(days[0].dateStr);
      return newWeek;
    });
  }, []);

  const goToThisWeek = useCallback(() => {
    const thisWeek = getWeekStartDate();
    setCurrentWeekStart(thisWeek);
    setSelectedDate(todayStr);
  }, [todayStr]);

  const saveDayMenu = useCallback(
    async (menu: DayMenu) => {
      if (isPastWeek) return;
      await saveMealMutation.mutateAsync(menu);
    },
    [isPastWeek, saveMealMutation]
  );

  const deleteDayMenu = useCallback(
    async (dateStr: string) => {
      if (isPastWeek) return;
      await deleteMealMutation.mutateAsync(dateStr);
    },
    [isPastWeek, deleteMealMutation]
  );

  const saveWeeklyRoutine = useCallback(
    async (routine: WeeklyRoutine) => {
      await saveRoutineMutation.mutateAsync(routine);
    },
    [saveRoutineMutation]
  );

  const applyRoutineToCurrentWeek = useCallback(async () => {
    if (isPastWeek) return;
    for (const day of weekDays) {
      const defaultMenu = generateMenuFromRoutine(day.dateStr, weeklyRoutine, slotConfigs);
      await saveMealMutation.mutateAsync(defaultMenu);
    }
  }, [isPastWeek, weekDays, weeklyRoutine, slotConfigs, saveMealMutation]);

  const updateSlotItems = useCallback(
    async (dateStr: string, slotId: string, items: string[], note?: string) => {
      if (isPastWeek) return;
      const currentMenu = getDayMenu(dateStr);
      const updatedSlots = currentMenu.slots.map((s) => {
        if (s.id === slotId) {
          return {
            ...s,
            items,
            note: note !== undefined ? note : s.note,
          };
        }
        return s;
      });

      await saveMealMutation.mutateAsync({
        ...currentMenu,
        slots: updatedSlots,
      });
    },
    [isPastWeek, getDayMenu, saveMealMutation]
  );

  const addItemToSlot = useCallback(
    async (dateStr: string, slotId: string, itemText: string) => {
      if (isPastWeek) return;
      const text = itemText.trim();
      if (!text) return;
      const currentMenu = getDayMenu(dateStr);

      const existingSlot = currentMenu.slots.find((s) => s.id === slotId);
      let updatedSlots: MealSlot[];

      if (existingSlot) {
        if (existingSlot.items.includes(text)) return;
        updatedSlots = currentMenu.slots.map((s) =>
          s.id === slotId ? { ...s, items: [...s.items, text] } : s
        );
      } else {
        const matchedCfg = slotConfigs.find((c) => c.id === slotId);
        const newSlot: MealSlot = {
          id: slotId,
          slotConfigId: matchedCfg?.id,
          name: matchedCfg?.name || slotId,
          icon: matchedCfg?.iconEmoji || '🍲',
          items: [text],
        };
        updatedSlots = [...currentMenu.slots, newSlot];
      }

      await saveMealMutation.mutateAsync({
        ...currentMenu,
        slots: updatedSlots,
      });
    },
    [isPastWeek, getDayMenu, slotConfigs, saveMealMutation]
  );

  const editSlotItem = useCallback(
    async (dateStr: string, slotId: string, itemIndex: number, newText: string) => {
      if (isPastWeek) return;
      const text = newText.trim();
      if (!text) return;
      const currentMenu = getDayMenu(dateStr);

      const updatedSlots = currentMenu.slots.map((s) => {
        if (s.id === slotId) {
          const updatedItems = [...s.items];
          updatedItems[itemIndex] = text;
          return { ...s, items: updatedItems };
        }
        return s;
      });

      await saveMealMutation.mutateAsync({
        ...currentMenu,
        slots: updatedSlots,
      });
    },
    [isPastWeek, getDayMenu, saveMealMutation]
  );

  const removeItemFromSlot = useCallback(
    async (dateStr: string, slotId: string, itemIndex: number) => {
      if (isPastWeek) return;
      const currentMenu = getDayMenu(dateStr);

      const updatedSlots = currentMenu.slots.map((s) => {
        if (s.id === slotId) {
          return {
            ...s,
            items: s.items.filter((_, idx) => idx !== itemIndex),
          };
        }
        return s;
      });

      await saveMealMutation.mutateAsync({
        ...currentMenu,
        slots: updatedSlots,
      });
    },
    [isPastWeek, getDayMenu, saveMealMutation]
  );

  const updateDayNote = useCallback(
    async (dateStr: string, note: string) => {
      if (isPastWeek) return;
      const currentMenu = getDayMenu(dateStr);
      await saveMealMutation.mutateAsync({
        ...currentMenu,
        note: note.trim() || undefined,
      });
    },
    [isPastWeek, getDayMenu, saveMealMutation]
  );

  const addCustomSlotToDay = useCallback(
    async (dateStr: string, slotName: string, iconEmoji = '🍲') => {
      if (isPastWeek) return;
      const currentMenu = getDayMenu(dateStr);
      const newSlot: MealSlot = {
        id: `custom-slot-${dateStr}-${Date.now()}`,
        name: slotName,
        icon: iconEmoji,
        items: [],
      };

      await saveMealMutation.mutateAsync({
        ...currentMenu,
        slots: [...currentMenu.slots, newSlot],
      });
    },
    [isPastWeek, getDayMenu, saveMealMutation]
  );

  const removeSlotFromDay = useCallback(
    async (dateStr: string, slotId: string) => {
      if (isPastWeek) return;
      const currentMenu = getDayMenu(dateStr);
      await saveMealMutation.mutateAsync({
        ...currentMenu,
        slots: currentMenu.slots.filter((s) => s.id !== slotId),
      });
    },
    [isPastWeek, getDayMenu, saveMealMutation]
  );

  const copyPreviousWeekToCurrent = useCallback(async () => {
    if (isPastWeek) return;
    const prevWeekStart = getPreviousWeek(currentWeekStart);
    const prevDays = getDaysInWeek(prevWeekStart);
    const prevStartDate = prevDays[0].dateStr;
    const prevEndDate = prevDays[6].dateStr;

    const prevMeals = await mealPlannerApi.getMeals(prevStartDate, prevEndDate);
    const prevMealsMap: Record<string, DayMenu> = {};
    prevMeals.forEach((m) => {
      prevMealsMap[m.date] = m;
    });

    for (let i = 0; i < weekDays.length; i++) {
      const prevDay = prevDays[i];
      const currentDay = weekDays[i];
      const prevMenu =
        prevMealsMap[prevDay.dateStr] ||
        generateMenuFromRoutine(prevDay.dateStr, weeklyRoutine, slotConfigs);

      if (prevMenu && prevMenu.slots && prevMenu.slots.some((s) => s.items && s.items.length > 0)) {
        const activeConfigMap = new Map(slotConfigs.map((c) => [c.id, c]));
        const targetSlots = prevMenu.slots
          .filter((s) => {
            if (s.slotConfigId) {
              return activeConfigMap.has(s.slotConfigId);
            }
            return s.items && s.items.length > 0;
          })
          .map((s) => {
            const matchedCfg = s.slotConfigId ? activeConfigMap.get(s.slotConfigId) : undefined;
            return {
              ...s,
              id: `slot-${currentDay.dateStr}-${s.slotConfigId || s.name}`,
              name: matchedCfg ? matchedCfg.name : s.name,
              icon: matchedCfg?.iconEmoji || s.icon || '🍲',
              items: [...s.items],
            };
          });

        await saveMealMutation.mutateAsync({
          id: `menu-${currentDay.dateStr}`,
          date: currentDay.dateStr,
          slots: targetSlots,
          note: prevMenu.note,
          updatedAt: new Date().toISOString(),
        });
      }
    }
  }, [isPastWeek, currentWeekStart, weekDays, weeklyRoutine, slotConfigs, saveMealMutation]);

  const clearCurrentWeek = useCallback(async () => {
    if (isPastWeek) return;
    for (const day of weekDays) {
      await deleteMealMutation.mutateAsync(day.dateStr);
    }
  }, [isPastWeek, weekDays, deleteMealMutation]);

  const saveSlotConfigs = useCallback(
    async (configs: MealSlotConfig[]) => {
      await saveSlotsMutation.mutateAsync(configs);
    },
    [saveSlotsMutation]
  );

  const saveDish = useCallback(
    async (dish: DishSuggestion) => {
      await saveDishMutation.mutateAsync(dish);
    },
    [saveDishMutation]
  );

  const deleteDish = useCallback(
    async (id: string) => {
      await deleteDishMutation.mutateAsync(id);
    },
    [deleteDishMutation]
  );

  const isLoading = isMealsLoading || isDishesLoading || isRoutineLoading || isSlotsLoading;

  return {
    currentWeekStart,
    setCurrentWeekStart,
    selectedDate,
    setSelectedDate,
    dayMenus,
    editedDates,
    weeklyRoutine,
    slotConfigs,
    dishes,
    weekDays,
    weekSummary,
    todayMenu,
    selectedDayMenu,
    isLoading,
    isPastWeek,
    isCurrentWeek,
    isFutureWeek,
    isEditable,
    goToPreviousWeek,
    goToNextWeek,
    goToThisWeek,
    saveDayMenu,
    deleteDayMenu,
    saveWeeklyRoutine,
    applyRoutineToCurrentWeek,
    updateSlotItems,
    addItemToSlot,
    editSlotItem,
    removeItemFromSlot,
    updateDayNote,
    addCustomSlotToDay,
    removeSlotFromDay,
    copyPreviousWeekToCurrent,
    clearCurrentWeek,
    saveSlotConfigs,
    saveDish,
    deleteDish,
  };
}
