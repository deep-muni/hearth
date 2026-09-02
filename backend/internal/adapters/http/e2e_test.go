package http_test

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	adaptershttp "house-help-budget/backend/internal/adapters/http"
	"house-help-budget/backend/internal/adapters/storage/inmemory"
	"house-help-budget/backend/internal/core/domain"
)

func setupTestServer() http.Handler {
	store := inmemory.New()
	return adaptershttp.NewRouter(
		store.Helpers(),
		store.Attendance(),
		store.Adjustments(),
		store.Backup(),
		"test",
		"househelp_test",
	)
}

func TestHealthEndpoint(t *testing.T) {
	router := setupTestServer()

	req := httptest.NewRequest(http.MethodGet, "/api/health", nil)
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", rec.Code)
	}

	var res map[string]any
	if err := json.NewDecoder(rec.Body).Decode(&res); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}

	if res["status"] != "ok" || res["environment"] != "test" || res["database"] != "househelp_test" {
		t.Fatalf("unexpected health response: %v", res)
	}
}

func TestHelpersE2E(t *testing.T) {
	router := setupTestServer()

	newHelper := domain.HouseHelp{
		Name:                "Lakshmi",
		Role:                "Cleaning",
		AvatarEmoji:         "🧹",
		ColorTheme:          "teal",
		SalaryType:          domain.SalaryTypeDaysLeaves,
		BaseSalary:          3500,
		PaidLeavesAllowance: 2,
		WeeklyOffDay:        0,
		IsActive:            true,
	}

	payload, _ := json.Marshal(newHelper)
	postReq := httptest.NewRequest(http.MethodPost, "/api/helpers", bytes.NewReader(payload))
	postReq.Header.Set("Content-Type", "application/json")
	postRec := httptest.NewRecorder()

	router.ServeHTTP(postRec, postReq)

	if postRec.Code != http.StatusOK {
		t.Fatalf("expected status 200 on create helper, got %d", postRec.Code)
	}

	var created domain.HouseHelp
	_ = json.NewDecoder(postRec.Body).Decode(&created)
	if created.ID == "" || created.Name != "Lakshmi" {
		t.Fatalf("unexpected created helper: %+v", created)
	}

	getReq := httptest.NewRequest(http.MethodGet, "/api/helpers", nil)
	getRec := httptest.NewRecorder()
	router.ServeHTTP(getRec, getReq)

	var helpers []domain.HouseHelp
	_ = json.NewDecoder(getRec.Body).Decode(&helpers)
	if len(helpers) != 1 {
		t.Fatalf("expected 1 helper, got %d", len(helpers))
	}

	getByIDReq := httptest.NewRequest(http.MethodGet, "/api/helpers/"+created.ID, nil)
	getByIDRec := httptest.NewRecorder()
	router.ServeHTTP(getByIDRec, getByIDReq)

	if getByIDRec.Code != http.StatusOK {
		t.Fatalf("expected 200 for single helper, got %d", getByIDRec.Code)
	}

	delReq := httptest.NewRequest(http.MethodDelete, "/api/helpers/"+created.ID+"?leftDate=2026-09", nil)
	delRec := httptest.NewRecorder()
	router.ServeHTTP(delRec, delReq)

	if delRec.Code != http.StatusNoContent {
		t.Fatalf("expected 204 on soft delete, got %d", delRec.Code)
	}

	activeReq := httptest.NewRequest(http.MethodGet, "/api/helpers?includeInactive=false", nil)
	activeRec := httptest.NewRecorder()
	router.ServeHTTP(activeRec, activeReq)

	var activeHelpers []domain.HouseHelp
	_ = json.NewDecoder(activeRec.Body).Decode(&activeHelpers)
	if len(activeHelpers) != 0 {
		t.Fatalf("expected 0 active helpers after soft delete, got %d", len(activeHelpers))
	}

	restoreReq := httptest.NewRequest(http.MethodPost, "/api/helpers/"+created.ID+"/restore", nil)
	restoreRec := httptest.NewRecorder()
	router.ServeHTTP(restoreRec, restoreReq)

	if restoreRec.Code != http.StatusOK {
		t.Fatalf("expected 200 on restore, got %d", restoreRec.Code)
	}

	hardDelReq := httptest.NewRequest(http.MethodDelete, "/api/helpers/"+created.ID+"?hard=true", nil)
	hardDelRec := httptest.NewRecorder()
	router.ServeHTTP(hardDelRec, hardDelReq)

	if hardDelRec.Code != http.StatusNoContent {
		t.Fatalf("expected 204 on hard delete, got %d", hardDelRec.Code)
	}
}

func TestAttendanceAndAdjustmentsE2E(t *testing.T) {
	router := setupTestServer()

	status := domain.StatusHalfLeave
	attRecord := domain.AttendanceRecord{
		HelperID: "h_100",
		Date:     "2026-09-10",
		Status:   &status,
		Note:     "Left at noon",
	}
	payload, _ := json.Marshal(attRecord)
	req := httptest.NewRequest(http.MethodPost, "/api/attendance", bytes.NewReader(payload))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200 on save attendance, got %d", rec.Code)
	}

	getReq := httptest.NewRequest(http.MethodGet, "/api/attendance?month=2026-09&helperId=h_100", nil)
	getRec := httptest.NewRecorder()
	router.ServeHTTP(getRec, getReq)

	var records []domain.AttendanceRecord
	_ = json.NewDecoder(getRec.Body).Decode(&records)
	if len(records) != 1 || records[0].Date != "2026-09-10" {
		t.Fatalf("expected 1 record for 2026-09-10, got %+v", records)
	}

	adj := domain.MonthlyAdjustment{
		HelperID:         "h_100",
		Month:            "2026-09",
		Bonus:            300,
		AdvanceDeduction: 100,
		IsPaid:           true,
		PaymentMethod:    "Cash",
	}
	adjPayload, _ := json.Marshal(adj)
	adjReq := httptest.NewRequest(http.MethodPost, "/api/adjustments", bytes.NewReader(adjPayload))
	adjReq.Header.Set("Content-Type", "application/json")
	adjRec := httptest.NewRecorder()
	router.ServeHTTP(adjRec, adjReq)

	if adjRec.Code != http.StatusOK {
		t.Fatalf("expected 200 on save adjustment, got %d", adjRec.Code)
	}

	getAdjReq := httptest.NewRequest(http.MethodGet, "/api/adjustments?month=2026-09&helperId=h_100", nil)
	getAdjRec := httptest.NewRecorder()
	router.ServeHTTP(getAdjRec, getAdjReq)

	var adjs []domain.MonthlyAdjustment
	_ = json.NewDecoder(getAdjRec.Body).Decode(&adjs)
	if len(adjs) != 1 || adjs[0].Bonus != 300 {
		t.Fatalf("expected 1 adjustment with bonus 300, got %+v", adjs)
	}

	backupReq := httptest.NewRequest(http.MethodGet, "/api/backup", nil)
	backupRec := httptest.NewRecorder()
	router.ServeHTTP(backupRec, backupReq)

	if backupRec.Code != http.StatusOK {
		t.Fatalf("expected 200 on backup export, got %d", backupRec.Code)
	}

	var backup domain.BackupData
	_ = json.NewDecoder(backupRec.Body).Decode(&backup)
	if len(backup.Attendance) != 1 || len(backup.Adjustments) != 1 {
		t.Fatalf("expected exported backup with 1 attendance and 1 adjustment record, got %+v", backup)
	}
}
