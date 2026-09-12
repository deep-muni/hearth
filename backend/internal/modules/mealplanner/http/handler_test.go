package http_test

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/go-chi/chi/v5"

	"hearth/backend/internal/modules/mealplanner/domain"
	mealHttp "hearth/backend/internal/modules/mealplanner/http"
	"hearth/backend/internal/modules/mealplanner/storage/inmemory"
)

func setupTestRouter() (http.Handler, *inmemory.Storage) {
	storage := inmemory.New()
	handler := mealHttp.NewMealPlannerHandler(
		storage.Meals(),
		storage.Dishes(),
		storage.Routine(),
		storage.Slots(),
	)

	r := chi.NewRouter()
	r.Route("/api", func(api chi.Router) {
		handler.RegisterRoutes(api)
	})

	return r, storage
}

func TestHistoricalIntegrity_SlotDeletionDoesNotAffectPastMeals(t *testing.T) {
	router, _ := setupTestRouter()
	ctx := context.Background()

	// 1. Configure 3 initial slots: Breakfast, Lunch, Evening Tea
	initialSlots := []domain.MealSlotConfig{
		{ID: "breakfast", Name: "Breakfast", IsEnabled: true, Order: 1},
		{ID: "lunch", Name: "Lunch", IsEnabled: true, Order: 2},
		{ID: "evening_tea", Name: "Evening Tea", IsEnabled: true, Order: 3},
	}
	slotsBody, _ := json.Marshal(initialSlots)
	req := httptest.NewRequestWithContext(ctx, "POST", "/api/meals/slots", bytes.NewReader(slotsBody))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)
	if w.Code != http.StatusOK {
		t.Fatalf("failed to save slots, status %d", w.Code)
	}

	// 2. Save a past meal (e.g. 2026-03-01) with Breakfast and Evening Tea
	pastMeal := domain.DayMenu{
		Date: "2026-03-01",
		Slots: []domain.MealSlot{
			{
				ID:           "slot-1",
				SlotConfigID: "breakfast",
				Name:         "Breakfast",
				Items:        []string{"Poha", "Coffee"},
			},
			{
				ID:           "slot-2",
				SlotConfigID: "evening_tea",
				Name:         "Evening Tea",
				Items:        []string{"Masala Chai", "Rusk"},
			},
		},
	}
	mealBody, _ := json.Marshal(pastMeal)
	req = httptest.NewRequestWithContext(ctx, "POST", "/api/meals", bytes.NewReader(mealBody))
	req.Header.Set("Content-Type", "application/json")
	w = httptest.NewRecorder()
	router.ServeHTTP(w, req)
	if w.Code != http.StatusOK {
		t.Fatalf("failed to save meal, status %d", w.Code)
	}

	// 3. User now deletes Evening Tea from slot configs (only Breakfast and Lunch remain)
	updatedSlots := []domain.MealSlotConfig{
		{ID: "breakfast", Name: "Breakfast", IsEnabled: true, Order: 1},
		{ID: "lunch", Name: "Lunch", IsEnabled: true, Order: 2},
	}
	updatedSlotsBody, _ := json.Marshal(updatedSlots)
	req = httptest.NewRequestWithContext(ctx, "POST", "/api/meals/slots", bytes.NewReader(updatedSlotsBody))
	req.Header.Set("Content-Type", "application/json")
	w = httptest.NewRecorder()
	router.ServeHTTP(w, req)
	if w.Code != http.StatusOK {
		t.Fatalf("failed to update slots, status %d", w.Code)
	}

	// 4. Verify GET /api/meals/slots only returns 2 active slots
	req = httptest.NewRequestWithContext(ctx, "GET", "/api/meals/slots", nil)
	w = httptest.NewRecorder()
	router.ServeHTTP(w, req)
	var returnedSlots []domain.MealSlotConfig
	_ = json.NewDecoder(w.Body).Decode(&returnedSlots)
	if len(returnedSlots) != 2 {
		t.Fatalf("expected 2 active slots, got %d", len(returnedSlots))
	}

	// 5. CRITICAL: Query past meal for 2026-03-01. Evening Tea MUST still be present in history!
	req = httptest.NewRequestWithContext(ctx, "GET", "/api/meals?date=2026-03-01", nil)
	w = httptest.NewRecorder()
	router.ServeHTTP(w, req)
	if w.Code != http.StatusOK {
		t.Fatalf("failed to get past meal, status %d", w.Code)
	}

	var fetchedMeal domain.DayMenu
	if err := json.NewDecoder(w.Body).Decode(&fetchedMeal); err != nil {
		t.Fatalf("failed to decode meal: %v", err)
	}

	if len(fetchedMeal.Slots) != 2 {
		t.Fatalf("expected past meal to retain 2 slots, got %d", len(fetchedMeal.Slots))
	}

	hasEveningTea := false
	for _, slot := range fetchedMeal.Slots {
		if slot.Name == "Evening Tea" && len(slot.Items) == 2 && slot.Items[0] == "Masala Chai" {
			hasEveningTea = true
		}
	}

	if !hasEveningTea {
		t.Errorf("history lost: past meal for 2026-03-01 is missing Evening Tea after slot was deleted")
	}
}

func TestHistoricalIntegrity_DishDeletionDoesNotWipePastMealItems(t *testing.T) {
	router, _ := setupTestRouter()
	ctx := context.Background()

	// 1. Add dish to library: Paneer Butter Masala
	dish := domain.DishSuggestion{
		ID:       "dish-paneer",
		Name:     "Paneer Butter Masala",
		Category: "lunch",
		IsVeg:    true,
		Tags:     []string{"Lunch", "Dinner"},
	}
	dishBody, _ := json.Marshal(dish)
	req := httptest.NewRequestWithContext(ctx, "POST", "/api/meals/dishes", bytes.NewReader(dishBody))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)
	if w.Code != http.StatusOK {
		t.Fatalf("failed to save dish, status %d", w.Code)
	}

	// 2. Save meal on 2026-03-02 containing Paneer Butter Masala
	meal := domain.DayMenu{
		Date: "2026-03-02",
		Slots: []domain.MealSlot{
			{
				ID:    "slot-lunch",
				Name:  "Lunch",
				Items: []string{"Paneer Butter Masala", "Jeera Rice"},
			},
		},
	}
	mealBody, _ := json.Marshal(meal)
	req = httptest.NewRequestWithContext(ctx, "POST", "/api/meals", bytes.NewReader(mealBody))
	req.Header.Set("Content-Type", "application/json")
	w = httptest.NewRecorder()
	router.ServeHTTP(w, req)
	if w.Code != http.StatusOK {
		t.Fatalf("failed to save meal, status %d", w.Code)
	}

	// 3. User deletes "Paneer Butter Masala" from dish library
	req = httptest.NewRequestWithContext(ctx, "DELETE", "/api/meals/dishes/dish-paneer", nil)
	w = httptest.NewRecorder()
	router.ServeHTTP(w, req)
	if w.Code != http.StatusNoContent && w.Code != http.StatusOK {
		t.Fatalf("failed to delete dish from library, status %d", w.Code)
	}

	// 4. Verify dish library no longer contains the dish
	req = httptest.NewRequestWithContext(ctx, "GET", "/api/meals/dishes", nil)
	w = httptest.NewRecorder()
	router.ServeHTTP(w, req)
	var dishes []domain.DishSuggestion
	_ = json.NewDecoder(w.Body).Decode(&dishes)
	for _, d := range dishes {
		if d.ID == "dish-paneer" {
			t.Fatalf("dish should have been deleted from library")
		}
	}

	// 5. CRITICAL: Query meal on 2026-03-02. It MUST still have "Paneer Butter Masala"!
	req = httptest.NewRequestWithContext(ctx, "GET", "/api/meals?date=2026-03-02", nil)
	w = httptest.NewRecorder()
	router.ServeHTTP(w, req)
	var savedMeal domain.DayMenu
	_ = json.NewDecoder(w.Body).Decode(&savedMeal)

	foundDish := false
	for _, item := range savedMeal.Slots[0].Items {
		if item == "Paneer Butter Masala" {
			foundDish = true
		}
	}

	if !foundDish {
		t.Errorf("history lost: past meal lost dish 'Paneer Butter Masala' after dish was deleted from library")
	}
}

func TestHistoricalIntegrity_DateRangeQueryReturnsCompleteHistory(t *testing.T) {
	router, _ := setupTestRouter()
	ctx := context.Background()

	// Save 3 meals across dates
	dates := []string{"2026-03-01", "2026-03-02", "2026-03-03"}
	for _, d := range dates {
		meal := domain.DayMenu{
			Date: d,
			Slots: []domain.MealSlot{
				{ID: "slot-d", Name: "Dinner", Items: []string{"Khichdi for " + d}},
			},
		}
		body, _ := json.Marshal(meal)
		req := httptest.NewRequestWithContext(ctx, "POST", "/api/meals", bytes.NewReader(body))
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)
	}

	// Query range
	req := httptest.NewRequestWithContext(ctx, "GET", "/api/meals?startDate=2026-03-01&endDate=2026-03-03", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	var meals []domain.DayMenu
	_ = json.NewDecoder(w.Body).Decode(&meals)
	if len(meals) != 3 {
		t.Fatalf("expected 3 meals in range, got %d", len(meals))
	}
}
