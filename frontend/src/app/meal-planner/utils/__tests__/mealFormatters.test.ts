import { describe, it, expect } from 'vitest';
import {
  formatWeekMenuForWhatsApp,
  formatDayMenuForWhatsApp,
  calculateWeekMenuSummary,
  generateMenuFromRoutine,
} from '../mealFormatters';
import { DayMenu, MealSlotConfig, WeeklyRoutine } from '../../types';

describe('mealFormatters', () => {
  const sampleMenu: DayMenu = {
    id: 'menu-2026-09-08',
    date: '2026-09-08',
    slots: [
      {
        id: 'slot-1',
        name: 'Breakfast',
        icon: '🌅',
        items: ['Poha', 'Masala Chai'],
        note: 'For 3 people',
      },
      {
        id: 'slot-2',
        name: 'Lunch',
        icon: '☀️',
        items: ['Dal Fry', 'Phulkas'],
      },
    ],
    note: 'Guests for lunch',
    updatedAt: new Date().toISOString(),
  };

  it('formats single day menu for WhatsApp', () => {
    const text = formatDayMenuForWhatsApp(sampleMenu);
    expect(text).toContain('*Menu — Tuesday, Sep 8*');
    expect(text).toContain('Breakfast: Poha, Masala Chai');
    expect(text).not.toContain('For 3 people');
    expect(text).not.toContain('Guests for lunch');
  });

  it('formats week menu for WhatsApp', () => {
    const dayMenus: Record<string, DayMenu> = {
      '2026-09-08': sampleMenu,
    };
    const text = formatWeekMenuForWhatsApp('2026-09-06', dayMenus);
    expect(text).toContain('*Weekly menu — Sep 6 to Sep 12*');
    expect(text).toContain('Breakfast: Poha, Masala Chai');
  });

  it('calculates week summary stats correctly', () => {
    const dayMenus: Record<string, DayMenu> = {
      '2026-09-08': sampleMenu,
    };
    const summary = calculateWeekMenuSummary('2026-09-06', dayMenus);
    expect(summary.totalDaysWithPlan).toBe(1);
    expect(summary.totalMealsPlanned).toBe(2);
    expect(summary.vegMealsCount).toBe(2);
    expect(summary.nonVegMealsCount).toBe(0);
  });

  it('generates day menu from routine template', () => {
    const routine: WeeklyRoutine = {
      2: {
        dayOfWeek: 2,
        dayName: 'Tuesday',
        slots: [
          {
            id: 'routine-slot-1',
            slotConfigId: 'slot-b',
            name: 'Breakfast',
            icon: '🌅',
            items: ['Idli', 'Sambar'],
          },
        ],
      },
    };

    const slotConfigs: MealSlotConfig[] = [
      {
        id: 'slot-b',
        name: 'Breakfast',
        iconEmoji: '🌅',
        isEnabled: true,
        order: 1,
      },
    ];

    const generated = generateMenuFromRoutine('2026-09-08', routine, slotConfigs);
    expect(generated.date).toBe('2026-09-08');
    expect(generated.slots.length).toBe(1);
    expect(generated.slots[0].items).toEqual(['Idli', 'Sambar']);
  });

  it('prunes deleted slots when generating menu from routine', () => {
    const routine: WeeklyRoutine = {
      2: {
        dayOfWeek: 2,
        dayName: 'Tuesday',
        slots: [
          {
            id: 'routine-slot-1',
            slotConfigId: 'slot-b',
            name: 'Breakfast',
            icon: '🌅',
            items: ['Idli'],
          },
          {
            id: 'routine-slot-2',
            slotConfigId: 'slot-snack',
            name: 'Evening Snack',
            icon: '☕',
            items: ['Tea', 'Samosa'],
          },
        ],
      },
    };

    // slot-snack has been deleted from active slotConfigs
    const activeSlotConfigs: MealSlotConfig[] = [
      {
        id: 'slot-b',
        name: 'Breakfast',
        iconEmoji: '🌅',
        isEnabled: true,
        order: 1,
      },
    ];

    const generated = generateMenuFromRoutine('2026-09-08', routine, activeSlotConfigs);
    expect(generated.slots.length).toBe(1);
    expect(generated.slots[0].name).toBe('Breakfast');
    expect(generated.slots[0].items).toEqual(['Idli']);
    expect(generated.slots.some((s) => s.slotConfigId === 'slot-snack')).toBe(false);
  });

  it('updates slot name when renamed in slotConfigs while preserving routine items', () => {
    const routine: WeeklyRoutine = {
      2: {
        dayOfWeek: 2,
        dayName: 'Tuesday',
        slots: [
          {
            id: 'routine-slot-1',
            slotConfigId: 'slot-b',
            name: 'Breakfast',
            icon: '🌅',
            items: ['Idli', 'Sambar'],
          },
        ],
      },
    };

    // Renamed slot-b from "Breakfast" to "Morning Brunch"
    const renamedSlotConfigs: MealSlotConfig[] = [
      {
        id: 'slot-b',
        name: 'Morning Brunch',
        iconEmoji: '🍳',
        isEnabled: true,
        order: 1,
      },
    ];

    const generated = generateMenuFromRoutine('2026-09-08', routine, renamedSlotConfigs);
    expect(generated.slots.length).toBe(1);
    expect(generated.slots[0].name).toBe('Morning Brunch');
    expect(generated.slots[0].items).toEqual(['Idli', 'Sambar']);
  });
});
