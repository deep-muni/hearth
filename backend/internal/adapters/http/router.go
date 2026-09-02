package http

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"

	"house-help-budget/backend/internal/core/ports"
	"house-help-budget/backend/internal/static"
)

func NewRouter(
	helpers ports.HelperRepository,
	attendance ports.AttendanceRepository,
	adjustments ports.AdjustmentRepository,
	backup ports.BackupRepository,
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

	helperHandler := NewHelperHandler(helpers)
	attendanceHandler := NewAttendanceHandler(attendance)
	adjHandler := NewAdjustmentHandler(adjustments)
	backupHandler := NewBackupHandler(backup)

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

		api.Get("/helpers", helperHandler.GetAll)
		api.Post("/helpers", helperHandler.Save)
		api.Get("/helpers/{id}", helperHandler.GetByID)
		api.Delete("/helpers/{id}", helperHandler.Delete)
		api.Post("/helpers/{id}/restore", helperHandler.Restore)

		api.Get("/attendance", attendanceHandler.Get)
		api.Post("/attendance", attendanceHandler.Save)
		api.Delete("/attendance", attendanceHandler.Delete)

		api.Get("/adjustments", adjHandler.Get)
		api.Post("/adjustments", adjHandler.Save)

		api.Get("/backup", backupHandler.Export)
		api.Post("/backup", backupHandler.Import)
	})

	r.NotFound(static.Handler().ServeHTTP)

	return r
}
