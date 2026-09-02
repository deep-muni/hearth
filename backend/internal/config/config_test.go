package config_test

import (
	"os"
	"testing"

	"house-help-budget/backend/internal/config"
)

func TestConfigEnvironmentDatabases(t *testing.T) {
	os.Unsetenv("APP_ENV")
	os.Unsetenv("MONGODB_DATABASE")
	cfg := config.Load()
	if cfg.Database != "househelp_dev" {
		t.Errorf("expected househelp_dev, got %s", cfg.Database)
	}

	os.Setenv("APP_ENV", "test")
	cfg = config.Load()
	if cfg.Database != "househelp_test" {
		t.Errorf("expected househelp_test, got %s", cfg.Database)
	}

	os.Setenv("APP_ENV", "production")
	cfg = config.Load()
	if cfg.Database != "househelp_prod" {
		t.Errorf("expected househelp_prod, got %s", cfg.Database)
	}

	os.Setenv("MONGODB_DATABASE", "custom_cluster_db")
	cfg = config.Load()
	if cfg.Database != "custom_cluster_db" {
		t.Errorf("expected custom_cluster_db, got %s", cfg.Database)
	}

	os.Unsetenv("APP_ENV")
	os.Unsetenv("MONGODB_DATABASE")
}

func TestConfigCredentialsConstruction(t *testing.T) {
	os.Unsetenv("MONGODB_URI")
	os.Setenv("MONGODB_USER", "admin")
	os.Setenv("MONGODB_PASSWORD", "secret123")
	os.Setenv("MONGODB_HOST", "cluster0.abcde.mongodb.net")

	cfg := config.Load()
	expected := "mongodb+srv://admin:secret123@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority"
	if cfg.MongoURI != expected {
		t.Errorf("expected %s, got %s", expected, cfg.MongoURI)
	}

	os.Unsetenv("MONGODB_USER")
	os.Unsetenv("MONGODB_PASSWORD")
	os.Unsetenv("MONGODB_HOST")
}
