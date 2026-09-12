package config_test

import (
	"os"
	"testing"

	"hearth/backend/internal/config"
)

func TestConfigEnvironmentDatabases(t *testing.T) {
	tests := []struct {
		name       string
		appEnv     string
		dbOverride string
		expectedDB string
	}{
		{
			name:       "default to local database",
			appEnv:     "",
			expectedDB: "hearth-local",
		},
		{
			name:       "explicit local env",
			appEnv:     "local",
			expectedDB: "hearth-local",
		},
		{
			name:       "development env",
			appEnv:     "development",
			expectedDB: "hearth-dev",
		},
		{
			name:       "short dev env",
			appEnv:     "dev",
			expectedDB: "hearth-dev",
		},
		{
			name:       "production env",
			appEnv:     "production",
			expectedDB: "hearth-prod",
		},
		{
			name:       "short prod env",
			appEnv:     "prod",
			expectedDB: "hearth-prod",
		},
		{
			name:       "explicit MONGODB_DATABASE env setting",
			appEnv:     "production",
			dbOverride: "hearth-custom",
			expectedDB: "hearth-custom",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			os.Unsetenv("APP_ENV")
			os.Unsetenv("MONGODB_DATABASE")
			os.Unsetenv("MONGODB_URI")
			os.Unsetenv("MONGODB_USER")
			os.Unsetenv("MONGODB_PASSWORD")
			os.Unsetenv("MONGODB_HOST")

			if tt.appEnv != "" {
				os.Setenv("APP_ENV", tt.appEnv)
			}
			if tt.dbOverride != "" {
				os.Setenv("MONGODB_DATABASE", tt.dbOverride)
			}

			cfg := config.Load()
			if cfg.Database != tt.expectedDB {
				t.Errorf("expected database %q, got %q", tt.expectedDB, cfg.Database)
			}
		})
	}

	os.Unsetenv("APP_ENV")
	os.Unsetenv("MONGODB_DATABASE")
}

func TestConfigCredentialsConstruction(t *testing.T) {
	t.Run("Cloud Atlas SRV host", func(t *testing.T) {
		os.Unsetenv("MONGODB_URI")
		os.Setenv("MONGODB_USER", "admin")
		os.Setenv("MONGODB_PASSWORD", "secret123")
		os.Setenv("MONGODB_HOST", "cluster0.abcde.mongodb.net")

		cfg := config.Load()
		expected := "mongodb+srv://admin:secret123@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority"
		if cfg.MongoURI != expected {
			t.Errorf("expected %s, got %s", expected, cfg.MongoURI)
		}
	})

	t.Run("Local standalone host with port", func(t *testing.T) {
		os.Unsetenv("MONGODB_URI")
		os.Setenv("MONGODB_USER", "admin")
		os.Setenv("MONGODB_PASSWORD", "password")
		os.Setenv("MONGODB_HOST", "127.0.0.1:27017")

		cfg := config.Load()
		expected := "mongodb://admin:password@127.0.0.1:27017/?directConnection=true&authSource=admin"
		if cfg.MongoURI != expected {
			t.Errorf("expected %s, got %s", expected, cfg.MongoURI)
		}
	})

	t.Run("Direct MONGODB_URI precedence", func(t *testing.T) {
		customURI := "mongodb://admin:password@127.0.0.1:27017/?directConnection=true&authSource=admin"
		os.Setenv("MONGODB_URI", customURI)
		cfg := config.Load()
		if cfg.MongoURI != customURI {
			t.Errorf("expected %s, got %s", customURI, cfg.MongoURI)
		}
	})

	os.Unsetenv("MONGODB_URI")
	os.Unsetenv("MONGODB_USER")
	os.Unsetenv("MONGODB_PASSWORD")
	os.Unsetenv("MONGODB_HOST")
}
