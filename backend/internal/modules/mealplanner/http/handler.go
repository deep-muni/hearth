package http

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"

	"house-help-budget/backend/internal/modules/mealplanner/domain"
	"house-help-budget/backend/internal/modules/mealplanner/ports"
)

type MealPlannerHandler struct {
	meals   ports.MealRepository
	dishes  ports.DishRepository
	routine ports.RoutineRepository
	slots   ports.SlotConfigRepository
}

func NewMealPlannerHandler(
	meals ports.MealRepository,
	dishes ports.DishRepository,
	routine ports.RoutineRepository,
	slots ports.SlotConfigRepository,
) *MealPlannerHandler {
	return &MealPlannerHandler{
		meals:   meals,
		dishes:  dishes,
		routine: routine,
		slots:   slots,
	}
}

func (h *MealPlannerHandler) RegisterRoutes(r chi.Router) {
	r.Get("/meals", h.GetMeals)
	r.Post("/meals", h.SaveMeal)
	r.Delete("/meals/{date}", h.DeleteMeal)

	r.Get("/meals/dishes", h.GetDishes)
	r.Post("/meals/dishes", h.SaveDish)
	r.Delete("/meals/dishes/{id}", h.DeleteDish)

	r.Get("/meals/routine", h.GetRoutine)
	r.Post("/meals/routine", h.SaveRoutine)

	r.Get("/meals/slots", h.GetSlots)
	r.Post("/meals/slots", h.SaveSlots)
}

func (h *MealPlannerHandler) GetMeals(w http.ResponseWriter, r *http.Request) {
	date := r.URL.Query().Get("date")
	startDate := r.URL.Query().Get("startDate")
	endDate := r.URL.Query().Get("endDate")

	if date != "" {
		menu, err := h.meals.GetByDate(r.Context(), date)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(menu)
		return
	}

	menus, err := h.meals.GetByDateRange(r.Context(), startDate, endDate)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(menus)
}

func (h *MealPlannerHandler) SaveMeal(w http.ResponseWriter, r *http.Request) {
	var menu domain.DayMenu
	if err := json.NewDecoder(r.Body).Decode(&menu); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	if menu.Date == "" {
		http.Error(w, "date is required", http.StatusBadRequest)
		return
	}

	saved, err := h.meals.Save(r.Context(), menu)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(saved)
}

func (h *MealPlannerHandler) DeleteMeal(w http.ResponseWriter, r *http.Request) {
	date := chi.URLParam(r, "date")
	if date == "" {
		http.Error(w, "date param required", http.StatusBadRequest)
		return
	}

	if err := h.meals.Delete(r.Context(), date); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *MealPlannerHandler) GetDishes(w http.ResponseWriter, r *http.Request) {
	dishes, err := h.dishes.GetAll(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(dishes)
}

func (h *MealPlannerHandler) SaveDish(w http.ResponseWriter, r *http.Request) {
	var dish domain.DishSuggestion
	if err := json.NewDecoder(r.Body).Decode(&dish); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	saved, err := h.dishes.Save(r.Context(), dish)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(saved)
}

func (h *MealPlannerHandler) DeleteDish(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if id == "" {
		http.Error(w, "id param required", http.StatusBadRequest)
		return
	}

	if err := h.dishes.Delete(r.Context(), id); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *MealPlannerHandler) GetRoutine(w http.ResponseWriter, r *http.Request) {
	routine, err := h.routine.Get(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(routine)
}

func (h *MealPlannerHandler) SaveRoutine(w http.ResponseWriter, r *http.Request) {
	var routine domain.WeeklyRoutine
	if err := json.NewDecoder(r.Body).Decode(&routine); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	if err := h.routine.Save(r.Context(), routine); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]string{"status": "saved"})
}

func (h *MealPlannerHandler) GetSlots(w http.ResponseWriter, r *http.Request) {
	slots, err := h.slots.GetAll(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(slots)
}

func (h *MealPlannerHandler) SaveSlots(w http.ResponseWriter, r *http.Request) {
	var slots []domain.MealSlotConfig
	if err := json.NewDecoder(r.Body).Decode(&slots); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	if err := h.slots.SaveAll(r.Context(), slots); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]string{"status": "saved"})
}
