package http

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"

	"house-help-budget/backend/internal/core/domain"
	"house-help-budget/backend/internal/core/ports"
)

type HelperHandler struct {
	repo ports.HelperRepository
}

func NewHelperHandler(repo ports.HelperRepository) *HelperHandler {
	return &HelperHandler{repo: repo}
}

func (h *HelperHandler) GetAll(w http.ResponseWriter, r *http.Request) {
	includeInactive := r.URL.Query().Get("includeInactive") == "true"
	helpers, err := h.repo.GetAll(r.Context(), includeInactive)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(helpers)
}

func (h *HelperHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	helper, err := h.repo.GetByID(r.Context(), id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if helper == nil {
		http.Error(w, "helper not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(helper)
}

func (h *HelperHandler) Save(w http.ResponseWriter, r *http.Request) {
	var helper domain.HouseHelp
	if err := json.NewDecoder(r.Body).Decode(&helper); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	saved, err := h.repo.Save(r.Context(), helper)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(saved)
}

func (h *HelperHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	isHard := r.URL.Query().Get("hard") == "true"
	leftDate := r.URL.Query().Get("leftDate")

	var err error
	if isHard {
		err = h.repo.HardDelete(r.Context(), id)
	} else {
		err = h.repo.SoftDelete(r.Context(), id, leftDate)
	}

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *HelperHandler) Restore(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if err := h.repo.Restore(r.Context(), id); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]string{"status": "restored"})
}
