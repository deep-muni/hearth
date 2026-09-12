package inmemory

import (
	"context"
	"testing"

	"hearth/backend/internal/modules/mealplanner/domain"
)

func TestMealCRUD(t *testing.T) {
	ctx := context.Background()
	s := New()
	repo := s.Meals()

	m, err := repo.Save(ctx, domain.DayMenu{
		Date: "2026-03-10",
		Slots: []domain.MealSlot{
			{ID: "s1", Name: "Breakfast", Items: []string{"Poha"}},
		},
	})
	if err != nil {
		t.Fatalf("Save error: %v", err)
	}

	if m.ID == "" {
		t.Errorf("expected generated ID")
	}

	got, err := repo.GetByDate(ctx, "2026-03-10")
	if err != nil {
		t.Fatalf("GetByDate error: %v", err)
	}
	if got == nil || got.Date != "2026-03-10" {
		t.Errorf("expected menu for 2026-03-10, got %v", got)
	}
}
