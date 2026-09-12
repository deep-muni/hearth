'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Flex } from '@chakra-ui/react';
import { WeekDayInfo } from '@/utils/dateUtils';
import { useMealPlanner } from '../hooks/useMealPlanner';
import { MealSlotConfig, ModalKind, SetupTab, UndoState } from '../types';
import {
  buildLibrary,
  cloneMenu,
  cloneRoutine,
  getOrderedSlots,
  normalizeDishName,
  slugify,
  slotToConfigSlot,
} from '../utils/mealLibrary';
import { MealPlannerHeader } from './navigation/MealPlannerHeader';
import { WeekBar } from './navigation/WeekBar';
import { DayCard } from './cards/DayCard';
import { ShareSheet } from './modals/ShareSheet';
import { SetupSheet } from './modals/SetupSheet';
import { UndoToast } from './ui/UndoToast';
import { MealPlannerLoader } from './MealPlannerLoader';

export const MealPlannerView: React.FC = () => {
  const {
    currentWeekStart,
    dayMenus,
    editedDates,
    weeklyRoutine,
    slotConfigs,
    dishes,
    weekDays,
    todayMenu,
    isCurrentWeek,
    isLoading,
    goToPreviousWeek,
    goToNextWeek,
    saveDayMenu,
    deleteDayMenu,
    saveWeeklyRoutine,
    saveSlotConfigs,
    saveDish,
    deleteDish,
  } = useMealPlanner();

  const [openState, setOpenState] = useState({ weekStart: currentWeekStart, day: -1 });
  const [modal, setModal] = useState<ModalKind>(null);
  const [setupTab, setSetupTab] = useState<SetupTab>('routine');
  const [routineOpen, setRoutineOpen] = useState(0);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [forgotten, setForgotten] = useState<Set<string>>(() => new Set());
  const [toast, setToast] = useState<UndoState | null>(null);
  const toastTimer = useRef<number | null>(null);

  const activeSlots = useMemo(() => getOrderedSlots(slotConfigs), [slotConfigs]);
  const library = useMemo(
    () => buildLibrary(dishes, weeklyRoutine, dayMenus, forgotten),
    [dishes, weeklyRoutine, dayMenus, forgotten]
  );

  useEffect(() => {
    if (!toast) return;
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 5000);
    return () => {
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
    };
  }, [toast]);

  const openDay = openState.weekStart === currentWeekStart ? openState.day : -1;

  const rememberDish = async (name: string, slotName: string) => {
    const normalized = normalizeDishName(name);
    if (!normalized) return;
    if (library.some((dish) => dish.name.toLowerCase() === normalized.toLowerCase())) return;
    await saveDish({
      id: `dish-${slugify(normalized) || Date.now()}`,
      name: normalized,
      category: 'all',
      isVeg: true,
      tags: [],
      defaultSlotName: slotName,
    });
  };

  const updateDaySlot = async (day: WeekDayInfo, slotConfig: MealSlotConfig, items: string[]) => {
    const currentMenu = cloneMenu(dayMenus[day.dateStr]);
    const existing = currentMenu.slots.find((slot) => slot.slotConfigId === slotConfig.id);
    const nextSlot = existing
      ? { ...existing, items }
      : slotToConfigSlot(day.dateStr, slotConfig, items);
    const slotsById = new Map(
      currentMenu.slots.map((slot) => [slot.slotConfigId || slot.id, slot])
    );
    slotsById.set(slotConfig.id, nextSlot);

    await saveDayMenu({
      ...currentMenu,
      slots: activeSlots.map(
        (slot) => slotsById.get(slot.id) || slotToConfigSlot(day.dateStr, slot)
      ),
      updatedAt: new Date().toISOString(),
    });
  };

  const addDishToDay = async (day: WeekDayInfo, slotConfig: MealSlotConfig, value: string) => {
    const dish = normalizeDishName(value);
    if (!dish) return;
    const slot = dayMenus[day.dateStr].slots.find((item) => item.slotConfigId === slotConfig.id);
    const currentItems = slot?.items || [];
    if (currentItems.some((item) => item.toLowerCase() === dish.toLowerCase())) return;
    await updateDaySlot(day, slotConfig, [...currentItems, dish]);
    await rememberDish(dish, slotConfig.name);
    setDrafts((prev) => ({ ...prev, [`${day.dateStr}-${slotConfig.id}`]: '' }));
  };

  const removeDishFromDay = async (day: WeekDayInfo, slotConfig: MealSlotConfig, index: number) => {
    const slot = dayMenus[day.dateStr].slots.find((item) => item.slotConfigId === slotConfig.id);
    await updateDaySlot(
      day,
      slotConfig,
      (slot?.items || []).filter((_, itemIndex) => itemIndex !== index)
    );
  };

  const backToRoutine = async (day: WeekDayInfo) => {
    const previous = cloneMenu(dayMenus[day.dateStr]);
    await deleteDayMenu(day.dateStr);
    setToast({
      text: `${day.dayFullName} back to routine`,
      restore: async () => saveDayMenu(previous),
    });
  };

  const promoteDay = async (day: WeekDayInfo) => {
    const previousRoutine = cloneRoutine(weeklyRoutine);
    const previousMenu = editedDates.has(day.dateStr) ? cloneMenu(dayMenus[day.dateStr]) : null;
    const menu = dayMenus[day.dateStr];
    const nextRoutine = cloneRoutine(weeklyRoutine);

    nextRoutine[day.dayOfWeek] = {
      dayOfWeek: day.dayOfWeek,
      dayName: day.dayFullName,
      slots: activeSlots.map((slotConfig) => {
        const plannedSlot = menu.slots.find((slot) => slot.slotConfigId === slotConfig.id);
        return slotToConfigSlot(`routine-${day.dayOfWeek}`, slotConfig, [
          ...(plannedSlot?.items || []),
        ]);
      }),
    };

    await saveWeeklyRoutine(nextRoutine);
    if (editedDates.has(day.dateStr)) await deleteDayMenu(day.dateStr);
    setToast({
      text: `Usual ${day.dayFullName} updated`,
      restore: async () => {
        await saveWeeklyRoutine(previousRoutine);
        if (previousMenu) await saveDayMenu(previousMenu);
      },
    });
  };

  return (
    <>
      <MealPlannerHeader
        onShare={() => setModal('share')}
        onSetup={() => {
          setSetupTab('routine');
          setModal('setup');
        }}
      />

      <WeekBar
        weekStart={currentWeekStart}
        isCurrentWeek={isCurrentWeek}
        onPrevious={goToPreviousWeek}
        onNext={goToNextWeek}
      />

      {isLoading && Object.keys(dayMenus).length === 0 ? (
        <MealPlannerLoader />
      ) : (
        <Flex direction="column" gap="10px">
          {weekDays.map((day, index) => (
            <DayCard
              key={day.dateStr}
              day={day}
              menu={dayMenus[day.dateStr]}
              slots={activeSlots}
              isOpen={openDay === index}
              isEdited={editedDates.has(day.dateStr)}
              library={library}
              drafts={drafts}
              onDraftChange={(key, value) => setDrafts((prev) => ({ ...prev, [key]: value }))}
              onToggle={() =>
                setOpenState({
                  weekStart: currentWeekStart,
                  day: openDay === index ? -1 : index,
                })
              }
              onAddDish={addDishToDay}
              onRemoveDish={removeDishFromDay}
              onBackToRoutine={backToRoutine}
              onPromote={promoteDay}
            />
          ))}
        </Flex>
      )}

      <ShareSheet
        isOpen={modal === 'share'}
        onClose={() => setModal(null)}
        weekStart={currentWeekStart}
        dayMenus={dayMenus}
        todayMenu={todayMenu}
        slotConfigs={activeSlots}
      />

      <SetupSheet
        isOpen={modal === 'setup'}
        onClose={() => setModal(null)}
        activeTab={setupTab}
        onTabChange={setSetupTab}
        routineOpen={routineOpen}
        onRoutineOpenChange={setRoutineOpen}
        routine={weeklyRoutine}
        slots={activeSlots}
        allSlots={slotConfigs}
        library={library}
        drafts={drafts}
        onDraftChange={(key, value) => setDrafts((prev) => ({ ...prev, [key]: value }))}
        onSaveRoutine={saveWeeklyRoutine}
        onSaveSlots={saveSlotConfigs}
        onSaveDish={saveDish}
        onDeleteDish={async (dish) => {
          setForgotten((prev) => new Set(prev).add(dish.name.toLowerCase()));
          if (dish.id) await deleteDish(dish.id);
        }}
      />

      {toast && <UndoToast toast={toast} onClose={() => setToast(null)} />}
    </>
  );
};
