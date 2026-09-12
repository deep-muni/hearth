'use client';

import React from 'react';
import { Box } from '@chakra-ui/react';
import { HearthModalShell } from '@/app/staff-budget/components/modals/HearthModalShell';
import { DishSuggestion, LibraryDish, MealSlotConfig, SetupTab, WeeklyRoutine } from '../../types';
import { Segmented } from '../ui/Segmented';
import { RoutineTab } from './RoutineTab';
import { SlotsTab } from './SlotsTab';
import { DishesTab } from './DishesTab';

interface SetupSheetProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: SetupTab;
  onTabChange: (tab: SetupTab) => void;
  routineOpen: number;
  onRoutineOpenChange: (day: number) => void;
  routine: WeeklyRoutine;
  slots: MealSlotConfig[];
  allSlots: MealSlotConfig[];
  library: LibraryDish[];
  drafts: Record<string, string>;
  onDraftChange: (key: string, value: string) => void;
  onSaveRoutine: (routine: WeeklyRoutine) => Promise<void>;
  onSaveSlots: (slots: MealSlotConfig[]) => Promise<void>;
  onSaveDish: (dish: DishSuggestion) => Promise<void>;
  onDeleteDish: (dish: LibraryDish) => Promise<void>;
}

export const SetupSheet: React.FC<SetupSheetProps> = ({
  isOpen,
  onClose,
  activeTab,
  onTabChange,
  routineOpen,
  onRoutineOpenChange,
  routine,
  slots,
  allSlots,
  library,
  drafts,
  onDraftChange,
  onSaveRoutine,
  onSaveSlots,
  onSaveDish,
  onDeleteDish,
}) => {
  return (
    <HearthModalShell
      isOpen={isOpen}
      onClose={onClose}
      title="Planner setup"
      subtitle="Routine, meal times and remembered dishes"
      maxWidth="440px"
    >
      <Segmented
        value={activeTab}
        options={[
          ['routine', 'Routine'],
          ['slots', 'Meal times'],
          ['dishes', 'Dishes'],
        ]}
        onChange={(value) => onTabChange(value as SetupTab)}
      />
      <Box mt="16px">
        {activeTab === 'routine' && (
          <RoutineTab
            routine={routine}
            slots={slots}
            openDay={routineOpen}
            onOpenDay={onRoutineOpenChange}
            drafts={drafts}
            onDraftChange={onDraftChange}
            onSaveRoutine={onSaveRoutine}
          />
        )}
        {activeTab === 'slots' && <SlotsTab slots={allSlots} onSaveSlots={onSaveSlots} />}
        {activeTab === 'dishes' && (
          <DishesTab library={library} onSaveDish={onSaveDish} onDeleteDish={onDeleteDish} />
        )}
      </Box>
    </HearthModalShell>
  );
};
