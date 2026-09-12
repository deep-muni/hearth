import { DayMenu, MealSlotConfig, WeekMenuSummary, WeeklyRoutine } from '@/app/meal-planner/types';
import { getDaysInWeek, parseISODate } from '@/utils/dateUtils';

export function generateMenuFromRoutine(
  dateStr: string,
  weeklyRoutine: WeeklyRoutine,
  slotConfigs: MealSlotConfig[]
): DayMenu {
  const date = parseISODate(dateStr);
  const dayOfWeek = date.getDay();
  const routineForDay = weeklyRoutine[dayOfWeek];

  const activeSlots = (slotConfigs || [])
    .filter((s) => s.isEnabled !== false)
    .sort((a, b) => a.order - b.order);

  const slots = activeSlots.map((cfg) => {
    const routineSlot = routineForDay?.slots?.find(
      (rs) => rs.slotConfigId === cfg.id || rs.name === cfg.name
    );
    return {
      id: `slot-${dateStr}-${cfg.id}`,
      slotConfigId: cfg.id,
      name: cfg.name,
      icon: cfg.iconEmoji || '🍲',
      items: routineSlot?.items ? [...routineSlot.items] : [],
      note: routineSlot?.note,
    };
  });

  return {
    id: `menu-${dateStr}`,
    date: dateStr,
    slots,
    updatedAt: new Date().toISOString(),
  };
}

export function formatWeekMenuForWhatsApp(
  weekStartDate: string,
  dayMenus: Record<string, DayMenu>
): string {
  const weekDays = getDaysInWeek(weekStartDate);
  const start = weekDays[0];
  const end = weekDays[6];

  let text = `*Weekly menu — ${start.monthShort} ${start.dayNumber} to ${end.monthShort} ${end.dayNumber}*\n`;

  weekDays.forEach((day) => {
    const menu = dayMenus[day.dateStr];
    const slotsWithItems = menu?.slots.filter((s) => s.items && s.items.length > 0) || [];

    if (slotsWithItems.length === 0) return;

    text += `\n*${day.dayFullName}, ${day.monthShort} ${day.dayNumber}*\n`;
    slotsWithItems.forEach((slot) => {
      text += `  ${slot.name}: ${slot.items.join(', ')}\n`;
    });
  });

  return text;
}

export function formatDayMenuForWhatsApp(
  dayMenu: DayMenu,
  slotConfigs: MealSlotConfig[] = []
): string {
  const date = parseISODate(dayMenu.date);
  const title = date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
  let text = `*Menu — ${title}*\n`;

  const activeSlots = dayMenu.slots.filter((s) => s.items && s.items.length > 0);

  activeSlots.forEach((slot) => {
    const time = slotConfigs.find((cfg) => cfg.id === slot.slotConfigId)?.defaultTime;
    text += `  ${slot.name}${time ? ` (${time})` : ''}: ${slot.items.join(', ')}\n`;
  });

  return text;
}

export function calculateWeekMenuSummary(
  weekStartDate: string,
  dayMenus: Record<string, DayMenu>
): WeekMenuSummary {
  const weekDays = getDaysInWeek(weekStartDate);
  let totalMeals = 0;
  let daysWithPlan = 0;
  let vegMeals = 0;
  let nonVegMeals = 0;

  weekDays.forEach((day) => {
    const menu = dayMenus[day.dateStr];
    if (menu) {
      const activeSlots = menu.slots.filter((s) => s.items && s.items.length > 0);
      if (activeSlots.length > 0) {
        daysWithPlan++;
        totalMeals += activeSlots.length;
        activeSlots.forEach((slot) => {
          const isNonVeg = slot.tags?.includes('non-veg');
          if (isNonVeg) {
            nonVegMeals++;
          } else {
            vegMeals++;
          }
        });
      }
    }
  });

  return {
    weekStartDate,
    weekEndDate: weekDays[6].dateStr,
    totalMealsPlanned: totalMeals,
    totalDaysWithPlan: daysWithPlan,
    vegMealsCount: vegMeals,
    nonVegMealsCount: nonVegMeals,
  };
}
