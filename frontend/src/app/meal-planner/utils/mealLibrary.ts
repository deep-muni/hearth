import {
  DayMenu,
  DishSuggestion,
  LibraryDish,
  MealSlot,
  MealSlotConfig,
  WeeklyRoutine,
} from '../types';

export function cloneMenu(menu: DayMenu): DayMenu {
  return {
    ...menu,
    slots: menu.slots.map((slot) => ({ ...slot, items: [...slot.items] })),
  };
}

export function cloneRoutine(routine: WeeklyRoutine): WeeklyRoutine {
  return Object.fromEntries(
    Object.entries(routine).map(([key, value]) => [
      key,
      {
        ...value,
        slots: value.slots.map((slot) => ({ ...slot, items: [...slot.items] })),
      },
    ])
  ) as WeeklyRoutine;
}

export function normalizeDishName(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function slotToConfigSlot(
  date: string,
  config: MealSlotConfig,
  items: string[] = []
): MealSlot {
  return {
    id: `slot-${date}-${config.id}`,
    slotConfigId: config.id,
    name: config.name,
    icon: config.iconEmoji || '🍲',
    items,
  };
}

export function getOrderedSlots(slots: MealSlotConfig[]): MealSlotConfig[] {
  return slots
    .filter((slot) => slot.isEnabled !== false)
    .sort((a, b) => a.order - b.order);
}

export function buildLibrary(
  savedDishes: DishSuggestion[],
  routine: WeeklyRoutine,
  dayMenus: Record<string, DayMenu>,
  forgotten: Set<string>
): LibraryDish[] {
  const byName = new Map<string, LibraryDish>();

  const ensure = (name: string, id?: string) => {
    const normalized = normalizeDishName(name);
    if (!normalized || forgotten.has(normalized.toLowerCase())) return null;
    const key = normalized.toLowerCase();
    const existing = byName.get(key);
    if (existing) {
      if (id && !existing.id) existing.id = id;
      return existing;
    }
    const dish: LibraryDish = { id, name: normalized, slots: [], totalUses: 0, slotUses: {} };
    byName.set(key, dish);
    return dish;
  };

  savedDishes.forEach((dish) => ensure(dish.name, dish.id));

  const addUse = (slot: MealSlot) => {
    slot.items.forEach((item) => {
      const dish = ensure(item);
      if (!dish) return;
      dish.totalUses += 1;
      dish.slotUses[slot.name] = (dish.slotUses[slot.name] || 0) + 1;
      if (!dish.slots.includes(slot.name)) dish.slots.push(slot.name);
    });
  };

  Object.values(routine).forEach((day) => day.slots.forEach(addUse));
  Object.values(dayMenus).forEach((day) => day.slots.forEach(addUse));

  return [...byName.values()].sort(
    (a, b) => b.totalUses - a.totalUses || a.name.localeCompare(b.name)
  );
}
