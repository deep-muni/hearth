package config_test

import (
	"os"
	"testing"

	"house-help-budget/backend/internal/config"
)

func TestConfigEnvironmentDatabases(t *testing.T) {
	// Test default development DB
	os.Unsetenv("APP_ENV")
	os.Unsetenv("MONGODB_DATABASE")
	cfg := config.Load()
	if cfg.Database != "househelp_dev" {
		t.Errorf("expected househelp_dev, got %s", cfg.Database)
	}

	// Test test environment DB
	os.Setenv("APP_ENV", "test")
	cfg = config.Load()
	if cfg.Database != "househelp_test" {
		t.Errorf("expected househelp_test, got %s", cfg.Database)
	}

	// Test production environment DB
	os.Setenv("APP_ENV", "production")
	cfg = config.Load()
	if cfg.Database != "househelp_prod" {
		t.Errorf("expected househelp_prod, got %s", cfg.Database)
	}

	// Test custom override
	os.Setenv("MONGODB_DATABASE", "custom_cluster_db")
	cfg = config.Load()
	if cfg.Database != "custom_cluster_db" {
		t.Errorf("expected custom_cluster_db, got %s", cfg.Database)
	}

	// Cleanup
	os.Unsetenv("APP_ENV")
	os.Unsetenv("MONGODB_DATABASE")
}
