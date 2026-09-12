import { StaffBudgetIcon, MealPlannerIcon } from '@/components/icons';
import { WorkspaceItem } from './types';

export const WORKSPACES: WorkspaceItem[] = [
  {
    id: 'staff-and-budget',
    title: 'Staff & Budget',
    description: 'Attendance, daily counts, leave tracking and auto-calculated salary slips.',
    href: '/staff-budget',
    icon: StaffBudgetIcon,
  },
  {
    id: 'weekly-meal-planner',
    title: 'Weekly Meal Planner',
    description: 'Breakfast, lunch, snacks and dinner, built from your master routine.',
    href: '/meal-planner',
    icon: MealPlannerIcon,
  },
];
