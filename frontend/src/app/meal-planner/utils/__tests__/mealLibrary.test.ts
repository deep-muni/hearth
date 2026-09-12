import { describe, it, expect } from 'vitest';
import {
  cloneMenu,
  cloneRoutine,
  normalizeDishName,
  slugify,
  slotToConfigSlot,
  getOrderedSlots,
  buildLibrary,
} from '../mealLibrary';
import { DayMenu, MealSlotConfig, WeeklyRoutine } from '../../types';

describe('mealLibrary utilities', () => {
  it('normalizes dish names correctly', () => {
    expect(normalizeDishName('  Paneer   Butter  Masala  ')).toBe('Paneer Butter Masala');
    expect(normalizeDishName('')).toBe('');
  });

  it('slugifies names into valid ids', () => {
    expect(slugify('Paneer Butter Masala!')).toBe('paneer-butter-masala');
    expect(slugify('  Dal Tadka & Roti  ')).toBe('dal-tadka-roti');
  });

  it('clones DayMenu deeply', () => {
    const original: DayMenu = {
      id: 'menu-2026-09-12',
      date: '2026-09-12',
      slots: [{ id: 's1', name: 'Lunch', icon: '🍲', items: ['Rice', 'Dal'] }],
      updatedAt: '2026-09-12T00:00:00Z',
    };
    const cloned = cloneMenu(original);
    expect(cloned).toEqual(original);
    cloned.slots[0].items.push('Roti');
    expect(original.slots[0].items).toEqual(['Rice', 'Dal']);
  });

  it('clones WeeklyRoutine deeply', () => {
    const original: WeeklyRoutine = {
      1: {
        dayOfWeek: 1,
        dayName: 'Monday',
        slots: [{ id: 's1', name: 'Breakfast', icon: '🌅', items: ['Poha'] }],
      },
    };
    const cloned = cloneRoutine(original);
    expect(cloned).toEqual(original);
    cloned[1].slots[0].items.push('Chai');
    expect(original[1].slots[0].items).toEqual(['Poha']);
  });

  it('creates slot from MealSlotConfig', () => {
    const config: MealSlotConfig = {
      id: 'lunch',
      name: 'Lunch',
      iconEmoji: '🥗',
      defaultTime: '1:00 PM',
      isEnabled: true,
      order: 2,
    };
    const slot = slotToConfigSlot('2026-09-12', config, ['Salad']);
    expect(slot).toEqual({
      id: 'slot-2026-09-12-lunch',
      slotConfigId: 'lunch',
      name: 'Lunch',
      icon: '🥗',
      items: ['Salad'],
    });
  });

  it('filters and orders slot configs', () => {
    const configs: MealSlotConfig[] = [
      { id: 'dinner', name: 'Dinner', iconEmoji: '🌙', isEnabled: true, order: 3 },
      { id: 'snack', name: 'Snack', iconEmoji: '☕', isEnabled: false, order: 2 },
      { id: 'breakfast', name: 'Breakfast', iconEmoji: '🌅', isEnabled: true, order: 1 },
    ];
    const ordered = getOrderedSlots(configs);
    expect(ordered.map((s) => s.id)).toEqual(['breakfast', 'dinner']);
  });

  it('builds library from saved dishes, routine, and day menus with frequency ranking', () => {
    const saved = [{ id: 'dish-1', name: 'Poha', category: 'all' as const, isVeg: true, tags: [] }];
    const routine: WeeklyRoutine = {
      1: {
        dayOfWeek: 1,
        dayName: 'Monday',
        slots: [{ id: 's1', name: 'Breakfast', icon: '🌅', items: ['Poha', 'Upma'] }],
      },
    };
    const dayMenus: Record<string, DayMenu> = {
      '2026-09-12': {
        id: 'menu-1',
        date: '2026-09-12',
        slots: [{ id: 's1', name: 'Breakfast', icon: '🌅', items: ['Poha'] }],
        updatedAt: '2026-09-12',
      },
    };
    const forgotten = new Set(['upma']);

    const library = buildLibrary(saved, routine, dayMenus, forgotten);
    expect(library.length).toBe(1);
    expect(library[0].name).toBe('Poha');
    expect(library[0].totalUses).toBe(2);
    expect(library[0].slotUses['Breakfast']).toBe(2);
  });
});
