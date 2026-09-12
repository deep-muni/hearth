package http

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"

	"house-help-budget/backend/internal/modules/staffbudget/domain"
	"house-help-budget/backend/internal/modules/staffbudget/ports"
)

type StaffBudgetHandler struct {
	staff       ports.StaffRepository
	attendance  ports.AttendanceRepository
	adjustments ports.AdjustmentRepository
}

func NewStaffBudgetHandler(
	staff ports.StaffRepository,
	attendance ports.AttendanceRepository,
	adjustments ports.AdjustmentRepository,
) *StaffBudgetHandler {
	return &StaffBudgetHandler{
		staff:       staff,
		attendance:  attendance,
		adjustments: adjustments,
	}
}

func (h *StaffBudgetHandler) RegisterRoutes(r chi.Router) {
	r.Route("/staff-budget", func(sub chi.Router) {
		sub.Get("/staff", h.GetAllStaff)
		sub.Post("/staff", h.SaveStaff)
		sub.Get("/staff/{id}", h.GetStaffByID)
		sub.Delete("/staff/{id}", h.DeleteStaff)
		sub.Post("/staff/{id}/restore", h.RestoreStaff)

		sub.Get("/attendance", h.GetAttendance)
		sub.Post("/attendance", h.SaveAttendance)
		sub.Delete("/attendance", h.DeleteAttendance)

		sub.Get("/adjustments", h.GetAdjustments)
		sub.Post("/adjustments", h.SaveAdjustment)
	})
}

func (h *StaffBudgetHandler) GetAllStaff(w http.ResponseWriter, r *http.Request) {
	includeInactive := r.URL.Query().Get("includeInactive") == "true"
	staffList, err := h.staff.GetAll(r.Context(), includeInactive)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(staffList)
}

func (h *StaffBudgetHandler) GetStaffByID(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	staff, err := h.staff.GetByID(r.Context(), id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if staff == nil {
		http.Error(w, "staff member not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(staff)
}

func (h *StaffBudgetHandler) SaveStaff(w http.ResponseWriter, r *http.Request) {
	var staff domain.StaffMember
	if err := json.NewDecoder(r.Body).Decode(&staff); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	saved, err := h.staff.Save(r.Context(), staff)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(saved)
}

func (h *StaffBudgetHandler) DeleteStaff(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	isHard := r.URL.Query().Get("hard") == "true"
	leftDate := r.URL.Query().Get("leftDate")

	var err error
	if isHard {
		err = h.staff.HardDelete(r.Context(), id)
	} else {
		err = h.staff.SoftDelete(r.Context(), id, leftDate)
	}

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *StaffBudgetHandler) RestoreStaff(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if err := h.staff.Restore(r.Context(), id); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]string{"status": "restored"})
}

type attendancePayload struct {
	ID         string                   `json:"id"`
	StaffID    string                   `json:"staffId"`
	Date       string                   `json:"date"`
	Status     *domain.AttendanceStatus `json:"status,omitempty"`
	ItemCount  *int                     `json:"itemCount,omitempty"`
	CustomRate *float64                 `json:"customRate,omitempty"`
	Note       string                   `json:"note,omitempty"`
}

func (h *StaffBudgetHandler) GetAttendance(w http.ResponseWriter, r *http.Request) {
	month := r.URL.Query().Get("month")
	staffID := r.URL.Query().Get("staffId")

	records, err := h.attendance.GetByMonth(r.Context(), month, staffID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(records)
}

func (h *StaffBudgetHandler) SaveAttendance(w http.ResponseWriter, r *http.Request) {
	var payload attendancePayload
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	staffID := payload.StaffID

	if staffID == "" || payload.Date == "" {
		http.Error(w, "staffId and date are required", http.StatusBadRequest)
		return
	}

	record := domain.AttendanceRecord{
		ID:         payload.ID,
		StaffID:    staffID,
		Date:       payload.Date,
		Status:     payload.Status,
		ItemCount:  payload.ItemCount,
		CustomRate: payload.CustomRate,
		Note:       payload.Note,
	}

	saved, err := h.attendance.Upsert(r.Context(), record)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(saved)
}

func (h *StaffBudgetHandler) DeleteAttendance(w http.ResponseWriter, r *http.Request) {
	staffID := r.URL.Query().Get("staffId")
	date := r.URL.Query().Get("date")

	if staffID == "" || date == "" {
		http.Error(w, "staffId and date query params required", http.StatusBadRequest)
		return
	}

	if err := h.attendance.Delete(r.Context(), staffID, date); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

type adjustmentPayload struct {
	StaffID          string  `json:"staffId"`
	Month            string  `json:"month"`
	Bonus            float64 `json:"bonus"`
	AdvanceDeduction float64 `json:"advanceDeduction"`
	Note             string  `json:"note,omitempty"`
	IsPaid           bool    `json:"isPaid"`
	PaidOn           string  `json:"paidOn,omitempty"`
	PaymentMethod    string  `json:"paymentMethod,omitempty"`
}

func (h *StaffBudgetHandler) GetAdjustments(w http.ResponseWriter, r *http.Request) {
	month := r.URL.Query().Get("month")
	staffID := r.URL.Query().Get("staffId")

	list, err := h.adjustments.GetByMonth(r.Context(), month, staffID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(list)
}

func (h *StaffBudgetHandler) SaveAdjustment(w http.ResponseWriter, r *http.Request) {
	var payload adjustmentPayload
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	staffID := payload.StaffID

	if staffID == "" || payload.Month == "" {
		http.Error(w, "staffId and month are required", http.StatusBadRequest)
		return
	}

	adj := domain.SalaryAdjustment{
		StaffID:          staffID,
		Month:            payload.Month,
		Bonus:            payload.Bonus,
		AdvanceDeduction: payload.AdvanceDeduction,
		Note:             payload.Note,
		IsPaid:           payload.IsPaid,
		PaidOn:           payload.PaidOn,
		PaymentMethod:    payload.PaymentMethod,
	}

	saved, err := h.adjustments.Upsert(r.Context(), adj)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(saved)
}
