package ports

import (
	"context"

	"house-help-budget/backend/internal/core/domain"
)

type HelperRepository interface {
	GetAll(ctx context.Context, includeInactive bool) ([]domain.HouseHelp, error)
	GetByID(ctx context.Context, id string) (*domain.HouseHelp, error)
	Save(ctx context.Context, helper domain.HouseHelp) (*domain.HouseHelp, error)
	SoftDelete(ctx context.Context, id string, leftDate string) error
	Restore(ctx context.Context, id string) error
	HardDelete(ctx context.Context, id string) error
}

type AttendanceRepository interface {
	GetByMonth(ctx context.Context, month string, helperID string) ([]domain.AttendanceRecord, error)
	Upsert(ctx context.Context, record domain.AttendanceRecord) (*domain.AttendanceRecord, error)
	Delete(ctx context.Context, helperID string, date string) error
}

type AdjustmentRepository interface {
	GetByMonth(ctx context.Context, month string, helperID string) ([]domain.MonthlyAdjustment, error)
	Upsert(ctx context.Context, adj domain.MonthlyAdjustment) (*domain.MonthlyAdjustment, error)
}
