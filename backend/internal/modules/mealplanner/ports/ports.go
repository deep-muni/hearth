package ports

import (
	"context"

	"house-help-budget/backend/internal/modules/mealplanner/domain"
)

type MealRepository interface {
	GetByDate(ctx context.Context, date string) (*domain.DayMenu, error)
	GetByDateRange(ctx context.Context, startDate, endDate string) ([]domain.DayMenu, error)
	Save(ctx context.Context, menu domain.DayMenu) (*domain.DayMenu, error)
	Delete(ctx context.Context, date string) error
}

type DishRepository interface {
	GetAll(ctx context.Context) ([]domain.DishSuggestion, error)
	Save(ctx context.Context, dish domain.DishSuggestion) (*domain.DishSuggestion, error)
	Delete(ctx context.Context, id string) error
}

type RoutineRepository interface {
	Get(ctx context.Context) (domain.WeeklyRoutine, error)
	Save(ctx context.Context, routine domain.WeeklyRoutine) error
}

type SlotConfigRepository interface {
	GetAll(ctx context.Context) ([]domain.MealSlotConfig, error)
	SaveAll(ctx context.Context, configs []domain.MealSlotConfig) error
}
