package http

import (
	"encoding/json"
	"net/http"

	"house-help-budget/backend/internal/core/domain"
	"house-help-budget/backend/internal/core/ports"
)

type AttendanceHandler struct {
	repo ports.AttendanceRepository
}

func NewAttendanceHandler(repo ports.AttendanceRepository) *AttendanceHandler {
	return &AttendanceHandler{repo: repo}
}

func (h *AttendanceHandler) Get(w http.ResponseWriter, r *http.Request) {
	month := r.URL.Query().Get("month")
	helperID := r.URL.Query().Get("helperId")

	records, err := h.repo.GetByMonth(r.Context(), month, helperID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(records)
}

func (h *AttendanceHandler) Save(w http.ResponseWriter, r *http.Request) {
	var record domain.AttendanceRecord
	if err := json.NewDecoder(r.Body).Decode(&record); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	if record.HelperID == "" || record.Date == "" {
		http.Error(w, "helperId and date are required", http.StatusBadRequest)
		return
	}

	saved, err := h.repo.Upsert(r.Context(), record)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(saved)
}

func (h *AttendanceHandler) Delete(w http.ResponseWriter, r *http.Request) {
	helperID := r.URL.Query().Get("helperId")
	date := r.URL.Query().Get("date")

	if helperID == "" || date == "" {
		http.Error(w, "helperId and date query parameters are required", http.StatusBadRequest)
		return
	}

	if err := h.repo.Delete(r.Context(), helperID, date); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
