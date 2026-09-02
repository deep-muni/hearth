package config

import (
	"fmt"
	"net/url"
	"os"
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

	appEnv := os.Getenv("APP_ENV")
	if appEnv == "" {
		appEnv = "development"
	}

	mongoURI := os.Getenv("MONGODB_URI")
	if mongoURI == "" {
		user := os.Getenv("MONGODB_USER")
		pass := os.Getenv("MONGODB_PASSWORD")
		host := os.Getenv("MONGODB_HOST")

		if user != "" && pass != "" && host != "" {
			mongoURI = fmt.Sprintf("mongodb+srv://%s:%s@%s/?retryWrites=true&w=majority", url.QueryEscape(user), url.QueryEscape(pass), host)
		} else {
			mongoURI = "mongodb://localhost:27017"
		}
	}

	dbName := os.Getenv("MONGODB_DATABASE")
	if dbName == "" {
		switch appEnv {
		case "production":
			dbName = "househelp_prod"
		case "test":
			dbName = "househelp_test"
		default:
			dbName = "househelp_dev"
		}
	}

	return Config{
		Port:     port,
		AppEnv:   appEnv,
		MongoURI: mongoURI,
		Database: dbName,
	}
}
