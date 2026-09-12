package inmemory

import (
	"context"
	"sync"
	"time"

	"github.com/google/uuid"

	"house-help-budget/backend/internal/modules/mealplanner/domain"
	"house-help-budget/backend/internal/modules/mealplanner/ports"
)

type Storage struct {
	mu      sync.RWMutex
	meals   map[string]domain.DayMenu
	dishes  map[string]domain.DishSuggestion
	routine domain.WeeklyRoutine
	slots   []domain.MealSlotConfig
}

func New() *Storage {
	return &Storage{
		meals:   make(map[string]domain.DayMenu),
		dishes:  make(map[string]domain.DishSuggestion),
		routine: make(domain.WeeklyRoutine),
		slots:   make([]domain.MealSlotConfig, 0),
	}
}

func (s *Storage) Meals() ports.MealRepository {
	return &MealRepo{s: s}
}

func (s *Storage) Dishes() ports.DishRepository {
	return &DishRepo{s: s}
}

func (s *Storage) Routine() ports.RoutineRepository {
	return &RoutineRepo{s: s}
}

func (s *Storage) Slots() ports.SlotConfigRepository {
	return &SlotRepo{s: s}
}

type MealRepo struct {
	s *Storage
}

func (r *MealRepo) GetByDate(_ context.Context, date string) (*domain.DayMenu, error) {
	r.s.mu.RLock()
	defer r.s.mu.RUnlock()

	m, ok := r.s.meals[date]
	if !ok {
		return nil, nil
	}
	return &m, nil
}

func (r *MealRepo) GetByDateRange(_ context.Context, startDate, endDate string) ([]domain.DayMenu, error) {
	r.s.mu.RLock()
	defer r.s.mu.RUnlock()

	var list []domain.DayMenu
	for _, m := range r.s.meals {
		if startDate != "" && m.Date < startDate {
			continue
		}
		if endDate != "" && m.Date > endDate {
			continue
		}
		list = append(list, m)
	}

	if list == nil {
		list = []domain.DayMenu{}
	}
	return list, nil
}

func (r *MealRepo) Save(_ context.Context, menu domain.DayMenu) (*domain.DayMenu, error) {
	r.s.mu.Lock()
	defer r.s.mu.Unlock()

	if menu.ID == "" {
		menu.ID = "menu_" + uuid.New().String()[:8]
	}
	menu.UpdatedAt = time.Now().UTC().Format(time.RFC3339)

	r.s.meals[menu.Date] = menu
	return &menu, nil
}

func (r *MealRepo) Delete(_ context.Context, date string) error {
	r.s.mu.Lock()
	defer r.s.mu.Unlock()

	delete(r.s.meals, date)
	return nil
}

type DishRepo struct {
	s *Storage
}

func (r *DishRepo) GetAll(_ context.Context) ([]domain.DishSuggestion, error) {
	r.s.mu.RLock()
	defer r.s.mu.RUnlock()

	var list []domain.DishSuggestion
	for _, d := range r.s.dishes {
		list = append(list, d)
	}
	if list == nil {
		list = []domain.DishSuggestion{}
	}
	return list, nil
}

func (r *DishRepo) Save(_ context.Context, dish domain.DishSuggestion) (*domain.DishSuggestion, error) {
	r.s.mu.Lock()
	defer r.s.mu.Unlock()

	if dish.ID == "" {
		dish.ID = "dish_" + uuid.New().String()[:8]
	}

	r.s.dishes[dish.ID] = dish
	return &dish, nil
}

func (r *DishRepo) Delete(_ context.Context, id string) error {
	r.s.mu.Lock()
	defer r.s.mu.Unlock()

	delete(r.s.dishes, id)
	return nil
}

type RoutineRepo struct {
	s *Storage
}

func (r *RoutineRepo) Get(_ context.Context) (domain.WeeklyRoutine, error) {
	r.s.mu.RLock()
	defer r.s.mu.RUnlock()

	copy := make(domain.WeeklyRoutine)
	for k, v := range r.s.routine {
		copy[k] = v
	}
	return copy, nil
}

func (r *RoutineRepo) Save(_ context.Context, routine domain.WeeklyRoutine) error {
	r.s.mu.Lock()
	defer r.s.mu.Unlock()

	r.s.routine = routine
	return nil
}

type SlotRepo struct {
	s *Storage
}

func (r *SlotRepo) GetAll(_ context.Context) ([]domain.MealSlotConfig, error) {
	r.s.mu.RLock()
	defer r.s.mu.RUnlock()

	res := make([]domain.MealSlotConfig, len(r.s.slots))
	copy(res, r.s.slots)
	return res, nil
}

func (r *SlotRepo) SaveAll(_ context.Context, configs []domain.MealSlotConfig) error {
	r.s.mu.Lock()
	defer r.s.mu.Unlock()

	r.s.slots = configs
	return nil
}
