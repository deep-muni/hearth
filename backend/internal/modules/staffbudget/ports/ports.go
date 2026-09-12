package ports

import (
	"context"

	"hearth/backend/internal/modules/staffbudget/domain"
)

type StaffRepository interface {
	GetAll(ctx context.Context, includeInactive bool) ([]domain.StaffMember, error)
	GetByID(ctx context.Context, id string) (*domain.StaffMember, error)
	Save(ctx context.Context, staff domain.StaffMember) (*domain.StaffMember, error)
	SoftDelete(ctx context.Context, id string, leftDate string) error
	Restore(ctx context.Context, id string) error
	HardDelete(ctx context.Context, id string) error
}

type AttendanceRepository interface {
	GetByMonth(ctx context.Context, month string, staffID string) ([]domain.AttendanceRecord, error)
	Upsert(ctx context.Context, record domain.AttendanceRecord) (*domain.AttendanceRecord, error)
	Delete(ctx context.Context, staffID string, date string) error
}

type AdjustmentRepository interface {
	GetByMonth(ctx context.Context, month string, staffID string) ([]domain.SalaryAdjustment, error)
	Upsert(ctx context.Context, adj domain.SalaryAdjustment) (*domain.SalaryAdjustment, error)
}

