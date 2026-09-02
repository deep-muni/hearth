package main

import (
	"context"
	"fmt"
	"log"
	nethttp "net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"house-help-budget/backend/internal/adapters/http"
	"house-help-budget/backend/internal/adapters/storage/mongodb"
	"house-help-budget/backend/internal/config"
)

func main() {
	cfg := config.Load()

	fmt.Printf("🏡 HouseHelp Budget API\n")
	fmt.Printf("   Environment: %s\n", cfg.AppEnv)
	fmt.Printf("   Database:    %s\n", cfg.Database)
	fmt.Printf("   Port:        %s\n", cfg.Port)

	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	database, err := mongodb.Connect(ctx, cfg.MongoURI, cfg.Database)
	if err != nil {
		log.Fatalf("Database connection error: %v", err)
	}
	defer func() {
		closeCtx, closeCancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer closeCancel()
		_ = database.Close(closeCtx)
	}()

	helperRepo := mongodb.NewHelperRepository(database.DB)
	attendanceRepo := mongodb.NewAttendanceRepository(database.DB)
	adjRepo := mongodb.NewAdjustmentRepository(database.DB)

	router := http.NewRouter(
		helperRepo,
		attendanceRepo,
		adjRepo,
		cfg.AppEnv,
		cfg.Database,
	)

	server := &nethttp.Server{
		Addr:         ":" + cfg.Port,
		Handler:      router,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt, syscall.SIGTERM)

	go func() {
		fmt.Printf("🚀 Listening on http://localhost:%s\n", cfg.Port)
		if err := server.ListenAndServe(); err != nil && err != nethttp.ErrServerClosed {
			log.Fatalf("Server error: %v", err)
		}
	}()

	<-stop
	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer shutdownCancel()
	_ = server.Shutdown(shutdownCtx)
}
