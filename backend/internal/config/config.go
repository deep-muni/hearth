package config

import (
	"fmt"
	"net/url"
	"os"
	"strings"
)

type Config struct {
	Port     string
	AppEnv   string
	MongoURI string
	Database string
}

func Load() Config {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	appEnv := strings.ToLower(strings.TrimSpace(os.Getenv("APP_ENV")))
	if appEnv == "" {
		appEnv = "local"
	}

	user := strings.TrimSpace(os.Getenv("MONGODB_USER"))
	pass := strings.TrimSpace(os.Getenv("MONGODB_PASSWORD"))
	host := strings.TrimSpace(os.Getenv("MONGODB_HOST"))

	var mongoURI string
	if rawURI := strings.TrimSpace(os.Getenv("MONGODB_URI")); rawURI != "" {
		mongoURI = rawURI
	} else if user != "" && pass != "" && host != "" {
		if strings.Contains(host, ":") || strings.HasPrefix(host, "127.0.0.1") || strings.HasPrefix(host, "localhost") {
			// Local/standalone instance with host:port
			mongoURI = fmt.Sprintf("mongodb://%s:%s@%s/?directConnection=true&authSource=admin", url.QueryEscape(user), url.QueryEscape(pass), host)
		} else {
			// Cloud cluster (e.g. MongoDB Atlas SRV)
			mongoURI = fmt.Sprintf("mongodb+srv://%s:%s@%s/?retryWrites=true&w=majority", url.QueryEscape(user), url.QueryEscape(pass), host)
		}
	} else {
		mongoURI = "mongodb://localhost:27017"
	}

	dbName := strings.TrimSpace(os.Getenv("MONGODB_DATABASE"))
	if dbName == "" {
		switch appEnv {
		case "production", "prod":
			dbName = "hearth-prod"
		case "development", "dev":
			dbName = "hearth-dev"
		default:
			dbName = "hearth-local"
		}
	}

	return Config{
		Port:     port,
		AppEnv:   appEnv,
		MongoURI: mongoURI,
		Database: dbName,
	}
}
