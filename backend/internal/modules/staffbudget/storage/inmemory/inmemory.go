package inmemory

import (
	"context"
	"errors"
	"sort"
	"strings"
	"sync"
	"time"

	"github.com/google/uuid"

	"house-help-budget/backend/internal/modules/staffbudget/domain"
	"house-help-budget/backend/internal/modules/staffbudget/ports"
)

type Storage struct {
	mu          sync.RWMutex
	staff       map[string]domain.StaffMember
	attendance  map[string]domain.AttendanceRecord
	adjustments map[string]domain.SalaryAdjustment
}

func New() *Storage {
	return &Storage{
		staff:       make(map[string]domain.StaffMember),
		attendance:  make(map[string]domain.AttendanceRecord),
		adjustments: make(map[string]domain.SalaryAdjustment),
	}
}

func (s *Storage) Staff() ports.StaffRepository {
	return &StaffRepo{s: s}
}

func (s *Storage) Attendance() ports.AttendanceRepository {
	return &AttendanceRepo{s: s}
}

func (s *Storage) Adjustments() ports.AdjustmentRepository {
	return &AdjustmentRepo{s: s}
}

type StaffRepo struct {
	s *Storage
}

func (r *StaffRepo) GetAll(_ context.Context, includeInactive bool) ([]domain.StaffMember, error) {
	r.s.mu.RLock()
	defer r.s.mu.RUnlock()

	var list []domain.StaffMember
	for _, h := range r.s.staff {
		if includeInactive || h.IsActive {
			list = append(list, h)
		}
	}

	sort.Slice(list, func(i, j int) bool {
		return list[i].Name < list[j].Name
	})

	if list == nil {
		list = []domain.StaffMember{}
	}
	return list, nil
}

func (r *StaffRepo) GetByID(_ context.Context, id string) (*domain.StaffMember, error) {
	r.s.mu.RLock()
	defer r.s.mu.RUnlock()

	h, ok := r.s.staff[id]
	if !ok {
		return nil, nil
	}
	return &h, nil
}

func (r *StaffRepo) Save(_ context.Context, staff domain.StaffMember) (*domain.StaffMember, error) {
	r.s.mu.Lock()
	defer r.s.mu.Unlock()

	if staff.ID == "" {
		staff.ID = "staff_" + uuid.New().String()[:8]
		staff.CreatedAt = time.Now().UTC().Format(time.RFC3339)
	}

	r.s.staff[staff.ID] = staff
	return &staff, nil
}

func (r *StaffRepo) SoftDelete(_ context.Context, id string, leftDate string) error {
	r.s.mu.Lock()
	defer r.s.mu.Unlock()

	h, ok := r.s.staff[id]
	if !ok {
		return errors.New("staff member not found")
	}

	if leftDate == "" {
		leftDate = time.Now().UTC().Format("2006-01")
	}

	h.IsActive = false
	h.LeftDate = leftDate
	r.s.staff[id] = h
	return nil
}

func (r *StaffRepo) Restore(_ context.Context, id string) error {
	r.s.mu.Lock()
	defer r.s.mu.Unlock()

	h, ok := r.s.staff[id]
	if !ok {
		return errors.New("staff member not found")
	}

	h.IsActive = true
	h.LeftDate = ""
	r.s.staff[id] = h
	return nil
}

func (r *StaffRepo) HardDelete(_ context.Context, id string) error {
	r.s.mu.Lock()
	defer r.s.mu.Unlock()

	delete(r.s.staff, id)

	for k, a := range r.s.attendance {
		if a.StaffID == id {
			delete(r.s.attendance, k)
		}
	}

	for k, adj := range r.s.adjustments {
		if adj.StaffID == id {
			delete(r.s.adjustments, k)
		}
	}

	return nil
}

type AttendanceRepo struct {
	s *Storage
}

func (r *AttendanceRepo) GetByMonth(_ context.Context, month string, staffID string) ([]domain.AttendanceRecord, error) {
	r.s.mu.RLock()
	defer r.s.mu.RUnlock()

	var list []domain.AttendanceRecord
	for _, a := range r.s.attendance {
		if month != "" && !strings.HasPrefix(a.Date, month) {
			continue
		}
		if staffID != "" && a.StaffID != staffID {
			continue
		}
		list = append(list, a)
	}

	sort.Slice(list, func(i, j int) bool {
		return list[i].Date < list[j].Date
	})

	if list == nil {
		list = []domain.AttendanceRecord{}
	}
	return list, nil
}

func (r *AttendanceRepo) Upsert(_ context.Context, record domain.AttendanceRecord) (*domain.AttendanceRecord, error) {
	r.s.mu.Lock()
	defer r.s.mu.Unlock()

	if record.ID == "" {
		record.ID = "att_" + uuid.New().String()[:8]
	}
	record.UpdatedAt = time.Now().UTC().Format(time.RFC3339)

	key := record.StaffID + "_" + record.Date
	r.s.attendance[key] = record
	return &record, nil
}

func (r *AttendanceRepo) Delete(_ context.Context, staffID string, date string) error {
	r.s.mu.Lock()
	defer r.s.mu.Unlock()

	key := staffID + "_" + date
	delete(r.s.attendance, key)
	return nil
}

type AdjustmentRepo struct {
	s *Storage
}

func (r *AdjustmentRepo) GetByMonth(_ context.Context, month string, staffID string) ([]domain.SalaryAdjustment, error) {
	r.s.mu.RLock()
	defer r.s.mu.RUnlock()

	var list []domain.SalaryAdjustment
	for _, adj := range r.s.adjustments {
		if month != "" && adj.Month != month {
			continue
		}
		if staffID != "" && adj.StaffID != staffID {
			continue
		}
		list = append(list, adj)
	}

	if list == nil {
		list = []domain.SalaryAdjustment{}
	}
	return list, nil
}

func (r *AdjustmentRepo) Upsert(_ context.Context, adj domain.SalaryAdjustment) (*domain.SalaryAdjustment, error) {
	r.s.mu.Lock()
	defer r.s.mu.Unlock()

	key := adj.StaffID + "_" + adj.Month
	r.s.adjustments[key] = adj
	return &adj, nil
}
