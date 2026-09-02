package inmemory

import (
	"context"
	"errors"
	"sort"
	"strings"
	"sync"
	"time"

	"github.com/google/uuid"

	"house-help-budget/backend/internal/core/domain"
	"house-help-budget/backend/internal/core/ports"
)

type Storage struct {
	mu          sync.RWMutex
	helpers     map[string]domain.HouseHelp
	attendance  map[string]domain.AttendanceRecord
	adjustments map[string]domain.MonthlyAdjustment
}

func New() *Storage {
	return &Storage{
		helpers:     make(map[string]domain.HouseHelp),
		attendance:  make(map[string]domain.AttendanceRecord),
		adjustments: make(map[string]domain.MonthlyAdjustment),
	}
}

type HelperRepo struct {
	s *Storage
}

func (s *Storage) Helpers() ports.HelperRepository {
	return &HelperRepo{s: s}
}

var _ ports.HelperRepository = (*HelperRepo)(nil)

func (r *HelperRepo) GetAll(_ context.Context, includeInactive bool) ([]domain.HouseHelp, error) {
	r.s.mu.RLock()
	defer r.s.mu.RUnlock()

	var list []domain.HouseHelp
	for _, h := range r.s.helpers {
		if includeInactive || h.IsActive {
			list = append(list, h)
		}
	}

	sort.Slice(list, func(i, j int) bool {
		return list[i].Name < list[j].Name
	})

	if list == nil {
		list = []domain.HouseHelp{}
	}
	return list, nil
}

func (r *HelperRepo) GetByID(_ context.Context, id string) (*domain.HouseHelp, error) {
	r.s.mu.RLock()
	defer r.s.mu.RUnlock()

	h, ok := r.s.helpers[id]
	if !ok {
		return nil, nil
	}
	return &h, nil
}

func (r *HelperRepo) Save(_ context.Context, helper domain.HouseHelp) (*domain.HouseHelp, error) {
	r.s.mu.Lock()
	defer r.s.mu.Unlock()

	if helper.ID == "" {
		helper.ID = "h_" + uuid.New().String()[:8]
		helper.CreatedAt = time.Now().UTC().Format(time.RFC3339)
	}

	r.s.helpers[helper.ID] = helper
	return &helper, nil
}

func (r *HelperRepo) SoftDelete(_ context.Context, id string, leftDate string) error {
	r.s.mu.Lock()
	defer r.s.mu.Unlock()

	h, ok := r.s.helpers[id]
	if !ok {
		return errors.New("helper not found")
	}

	if leftDate == "" {
		leftDate = time.Now().UTC().Format("2006-01")
	}

	h.IsActive = false
	h.LeftDate = leftDate
	r.s.helpers[id] = h
	return nil
}

func (r *HelperRepo) Restore(_ context.Context, id string) error {
	r.s.mu.Lock()
	defer r.s.mu.Unlock()

	h, ok := r.s.helpers[id]
	if !ok {
		return errors.New("helper not found")
	}

	h.IsActive = true
	h.LeftDate = ""
	r.s.helpers[id] = h
	return nil
}

func (r *HelperRepo) HardDelete(_ context.Context, id string) error {
	r.s.mu.Lock()
	defer r.s.mu.Unlock()

	delete(r.s.helpers, id)

	for k, a := range r.s.attendance {
		if a.HelperID == id {
			delete(r.s.attendance, k)
		}
	}

	for k, adj := range r.s.adjustments {
		if adj.HelperID == id {
			delete(r.s.adjustments, k)
		}
	}

	return nil
}

type AttendanceRepo struct {
	s *Storage
}

func (s *Storage) Attendance() ports.AttendanceRepository {
	return &AttendanceRepo{s: s}
}

var _ ports.AttendanceRepository = (*AttendanceRepo)(nil)

func (r *AttendanceRepo) GetByMonth(_ context.Context, month string, helperID string) ([]domain.AttendanceRecord, error) {
	r.s.mu.RLock()
	defer r.s.mu.RUnlock()

	var list []domain.AttendanceRecord
	for _, a := range r.s.attendance {
		if month != "" && !strings.HasPrefix(a.Date, month) {
			continue
		}
		if helperID != "" && a.HelperID != helperID {
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

	key := record.HelperID + "_" + record.Date
	r.s.attendance[key] = record
	return &record, nil
}

func (r *AttendanceRepo) Delete(_ context.Context, helperID string, date string) error {
	r.s.mu.Lock()
	defer r.s.mu.Unlock()

	key := helperID + "_" + date
	delete(r.s.attendance, key)
	return nil
}

type AdjustmentRepo struct {
	s *Storage
}

func (s *Storage) Adjustments() ports.AdjustmentRepository {
	return &AdjustmentRepo{s: s}
}

var _ ports.AdjustmentRepository = (*AdjustmentRepo)(nil)

func (r *AdjustmentRepo) GetByMonth(_ context.Context, month string, helperID string) ([]domain.MonthlyAdjustment, error) {
	r.s.mu.RLock()
	defer r.s.mu.RUnlock()

	var list []domain.MonthlyAdjustment
	for _, adj := range r.s.adjustments {
		if month != "" && adj.Month != month {
			continue
		}
		if helperID != "" && adj.HelperID != helperID {
			continue
		}
		list = append(list, adj)
	}

	if list == nil {
		list = []domain.MonthlyAdjustment{}
	}
	return list, nil
}

func (r *AdjustmentRepo) Upsert(_ context.Context, adj domain.MonthlyAdjustment) (*domain.MonthlyAdjustment, error) {
	r.s.mu.Lock()
	defer r.s.mu.Unlock()

	key := adj.HelperID + "_" + adj.Month
	r.s.adjustments[key] = adj
	return &adj, nil
}
