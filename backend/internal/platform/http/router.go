package http

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"

	mealplannerHttp "house-help-budget/backend/internal/modules/mealplanner/http"
	staffbudgetHttp "house-help-budget/backend/internal/modules/staffbudget/http"
	"house-help-budget/backend/internal/static"
)

func NewRouter(
	staffBudgetHandler *staffbudgetHttp.StaffBudgetHandler,
	mealPlannerHandler *mealplannerHttp.MealPlannerHandler,
	env string,
	dbName string,
) http.Handler {
	r := chi.NewRouter()

	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.Timeout(30 * time.Second))

	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: false,
		MaxAge:           300,
	}))

	registerHandlers := func(router chi.Router) {
		if staffBudgetHandler != nil {
			staffBudgetHandler.RegisterRoutes(router)
		}

		if mealPlannerHandler != nil {
			mealPlannerHandler.RegisterRoutes(router)
		}
	}

	r.Route("/api", func(api chi.Router) {
		api.Get("/health", func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Content-Type", "application/json")
			_ = json.NewEncoder(w).Encode(map[string]any{
				"status":      "ok",
				"environment": env,
				"database":    dbName,
				"timestamp":   time.Now().UTC().Format(time.RFC3339),
			})
		})

		registerHandlers(api)
	})


	r.NotFound(static.Handler().ServeHTTP)

	return r
}
