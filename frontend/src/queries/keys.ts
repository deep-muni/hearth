export const queryKeys = {
  helpers: {
    all: ['helpers'] as const,
    list: (includeInactive = true) => ['helpers', 'list', { includeInactive }] as const,
  },
  attendance: {
    all: ['attendance'] as const,
    byMonth: (month: string, helperId?: string) =>
      ['attendance', 'byMonth', { month, helperId }] as const,
  },
  adjustments: {
    all: ['adjustments'] as const,
    byMonth: (month: string, helperId?: string) =>
      ['adjustments', 'byMonth', { month, helperId }] as const,
  },
};
