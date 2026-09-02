package http

import (
	"encoding/json"
	"net/http"

	"house-help-budget/backend/internal/core/domain"
	"house-help-budget/backend/internal/core/ports"
)

type BackupHandler struct {
	repo ports.BackupRepository
}

func NewBackupHandler(repo ports.BackupRepository) *BackupHandler {
	return &BackupHandler{repo: repo}
}

func (h *BackupHandler) Export(w http.ResponseWriter, r *http.Request) {
	data, err := h.repo.ExportAll(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(data)
}

func (h *BackupHandler) Import(w http.ResponseWriter, r *http.Request) {
	var data domain.BackupData
	if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
		http.Error(w, "invalid backup JSON payload", http.StatusBadRequest)
		return
	}

	if err := h.repo.ImportAll(r.Context(), data); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]string{"status": "imported"})
}
