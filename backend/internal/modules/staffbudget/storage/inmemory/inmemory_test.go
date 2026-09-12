package inmemory

import (
	"context"
	"testing"

	"hearth/backend/internal/modules/staffbudget/domain"
)

func TestStaffCRUD(t *testing.T) {
	ctx := context.Background()
	s := New()
	repo := s.Staff()

	h, err := repo.Save(ctx, domain.StaffMember{
		Name:       "Geeta",
		Role:       "Maid",
		BaseSalary: 4000,
		IsActive:   true,
	})
	if err != nil {
		t.Fatalf("Save error: %v", err)
	}

	if h.ID == "" {
		t.Errorf("expected generated ID")
	}

	list, err := repo.GetAll(ctx, false)
	if err != nil {
		t.Fatalf("GetAll error: %v", err)
	}
	if len(list) != 1 {
		t.Errorf("expected 1 staff member, got %d", len(list))
	}
}
