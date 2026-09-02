package inmemory_test

import (
	"context"
	"testing"

	"house-help-budget/backend/internal/adapters/storage/inmemory"
	"house-help-budget/backend/internal/core/domain"
)

func TestInMemoryHelperRepository(t *testing.T) {
	ctx := context.Background()
	store := inmemory.New()
	repo := store.Helpers()

	h1, err := repo.Save(ctx, domain.HouseHelp{
		Name:                "Sunita Sharma",
		Role:                "Cook",
		AvatarEmoji:         "👩‍🍳",
		ColorTheme:          "rose",
		SalaryType:          domain.SalaryTypeDaysLeaves,
		BaseSalary:          4500,
		PaidLeavesAllowance: 2,
		WeeklyOffDay:        0,
		IsActive:            true,
	})
	if err != nil {
		t.Fatalf("failed to save helper: %v", err)
	}

	if h1.ID == "" {
		t.Fatalf("expected generated ID, got empty")
	}

	fetched, err := repo.GetByID(ctx, h1.ID)
	if err != nil || fetched == nil {
		t.Fatalf("expected to fetch helper by ID, got error: %v", err)
	}
	if fetched.Name != "Sunita Sharma" {
		t.Errorf("expected name Sunita Sharma, got %s", fetched.Name)
	}

	all, err := repo.GetAll(ctx, true)
	if err != nil || len(all) != 1 {
		t.Fatalf("expected 1 helper, got %d", len(all))
	}

	err = repo.SoftDelete(ctx, h1.ID, "2026-09")
	if err != nil {
		t.Fatalf("failed to soft delete: %v", err)
	}

	activeOnly, err := repo.GetAll(ctx, false)
	if err != nil || len(activeOnly) != 0 {
		t.Fatalf("expected 0 active helpers, got %d", len(activeOnly))
	}

	err = repo.Restore(ctx, h1.ID)
	if err != nil {
		t.Fatalf("failed to restore: %v", err)
	}

	restored, err := repo.GetByID(ctx, h1.ID)
	if err != nil || !restored.IsActive || restored.LeftDate != "" {
		t.Fatalf("expected restored active helper with empty leftDate")
	}

	err = repo.HardDelete(ctx, h1.ID)
	if err != nil {
		t.Fatalf("failed to hard delete: %v", err)
	}

	afterDelete, err := repo.GetByID(ctx, h1.ID)
	if err != nil || afterDelete != nil {
		t.Fatalf("expected nil helper after hard delete, got %v", afterDelete)
	}
}

func TestInMemoryAttendanceAndAdjustments(t *testing.T) {
	ctx := context.Background()
	store := inmemory.New()
	attRepo := store.Attendance()
	adjRepo := store.Adjustments()

	status := domain.StatusFullLeave
	record, err := attRepo.Upsert(ctx, domain.AttendanceRecord{
		HelperID: "h_1",
		Date:     "2026-09-05",
		Status:   &status,
		Note:     "Family function",
	})
	if err != nil || record.ID == "" {
		t.Fatalf("failed to upsert attendance: %v", err)
	}

	list, err := attRepo.GetByMonth(ctx, "2026-09", "h_1")
	if err != nil || len(list) != 1 {
		t.Fatalf("expected 1 attendance record, got %d", len(list))
	}

	adj, err := adjRepo.Upsert(ctx, domain.MonthlyAdjustment{
		HelperID:         "h_1",
		Month:            "2026-09",
		Bonus:            500,
		AdvanceDeduction: 200,
		IsPaid:           true,
		PaymentMethod:    "UPI",
	})
	if err != nil || adj.Bonus != 500 {
		t.Fatalf("failed to upsert adjustment: %v", err)
	}

	adjList, err := adjRepo.GetByMonth(ctx, "2026-09", "h_1")
	if err != nil || len(adjList) != 1 || !adjList[0].IsPaid {
		t.Fatalf("expected 1 paid adjustment record")
	}

	err = attRepo.Delete(ctx, "h_1", "2026-09-05")
	if err != nil {
		t.Fatalf("failed to delete attendance: %v", err)
	}

	afterDel, err := attRepo.GetByMonth(ctx, "2026-09", "h_1")
	if err != nil || len(afterDel) != 0 {
		t.Fatalf("expected 0 attendance records after deletion, got %d", len(afterDel))
	}
}

func TestInMemoryBackupExportImport(t *testing.T) {
	ctx := context.Background()
	store := inmemory.New()

	_, _ = store.Helpers().Save(ctx, domain.HouseHelp{
		ID:         "h_1",
		Name:       "Geeta",
		Role:       "Maid",
		BaseSalary: 3000,
		IsActive:   true,
	})

	backup, err := store.Backup().ExportAll(ctx)
	if err != nil || len(backup.Helpers) != 1 {
		t.Fatalf("expected 1 helper in backup export, got %v", err)
	}

	store2 := inmemory.New()
	err = store2.Backup().ImportAll(ctx, *backup)
	if err != nil {
		t.Fatalf("failed to import backup: %v", err)
	}

	imported, err := store2.Helpers().GetAll(ctx, true)
	if err != nil || len(imported) != 1 || imported[0].Name != "Geeta" {
		t.Fatalf("expected 1 imported helper named Geeta, got %v", imported)
	}
}
