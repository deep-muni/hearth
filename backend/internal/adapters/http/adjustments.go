package http

import (
	"encoding/json"
	"net/http"

	"house-help-budget/backend/internal/core/domain"
	"house-help-budget/backend/internal/core/ports"
)

type AdjustmentHandler struct {
	repo ports.AdjustmentRepository
}

func NewAdjustmentHandler(repo ports.AdjustmentRepository) *AdjustmentHandler {
	return &AdjustmentHandler{repo: repo}
}

func (h *AdjustmentHandler) Get(w http.ResponseWriter, r *http.Request) {
	month := r.URL.Query().Get("month")
	helperID := r.URL.Query().Get("helperId")

	adjustments, err := h.repo.GetByMonth(r.Context(), month, helperID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(adjustments)
}

func (h *AdjustmentHandler) Save(w http.ResponseWriter, r *http.Request) {
	var adj domain.MonthlyAdjustment
	if err := json.NewDecoder(r.Body).Decode(&adj); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	if adj.HelperID == "" || adj.Month == "" {
		http.Error(w, "helperId and month are required", http.StatusBadRequest)
		return
	}

	saved, err := h.repo.Upsert(r.Context(), adj)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(saved)
}
