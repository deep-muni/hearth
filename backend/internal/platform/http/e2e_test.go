package http

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	mealplannerHttp "hearth/backend/internal/modules/mealplanner/http"
	mealplannerInmem "hearth/backend/internal/modules/mealplanner/storage/inmemory"
	staffbudgetHttp "hearth/backend/internal/modules/staffbudget/http"
	staffbudgetInmem "hearth/backend/internal/modules/staffbudget/storage/inmemory"
)

func TestHealthEndpoint(t *testing.T) {
	sbStorage := staffbudgetInmem.New()
	sbHandler := staffbudgetHttp.NewStaffBudgetHandler(sbStorage.Staff(), sbStorage.Attendance(), sbStorage.Adjustments())

	mpStorage := mealplannerInmem.New()
	mpHandler := mealplannerHttp.NewMealPlannerHandler(mpStorage.Meals(), mpStorage.Dishes(), mpStorage.Routine(), mpStorage.Slots())

	router := NewRouter(sbHandler, mpHandler, "test", "inmemory")

	req, _ := http.NewRequestWithContext(context.Background(), "GET", "/api/health", nil)
	rr := httptest.NewRecorder()

	router.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", rr.Code)
	}

	var res map[string]any
	if err := json.NewDecoder(rr.Body).Decode(&res); err != nil {
		t.Fatalf("decode error: %v", err)
	}

	if res["status"] != "ok" {
		t.Errorf("expected status ok, got %v", res["status"])
	}
}

func TestStaffBudgetEndpoints(t *testing.T) {
	sbStorage := staffbudgetInmem.New()
	sbHandler := staffbudgetHttp.NewStaffBudgetHandler(sbStorage.Staff(), sbStorage.Attendance(), sbStorage.Adjustments())

	mpStorage := mealplannerInmem.New()
	mpHandler := mealplannerHttp.NewMealPlannerHandler(mpStorage.Meals(), mpStorage.Dishes(), mpStorage.Routine(), mpStorage.Slots())

	router := NewRouter(sbHandler, mpHandler, "test", "inmemory")

	req, _ := http.NewRequestWithContext(context.Background(), "GET", "/api/staff-budget/staff", nil)
	rr := httptest.NewRecorder()

	router.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", rr.Code)
	}
}
