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

	"house-help-budget/backend/internal/config"
	mealplannerHttp "house-help-budget/backend/internal/modules/mealplanner/http"
	mealplannerMongo "house-help-budget/backend/internal/modules/mealplanner/storage/mongodb"
	staffbudgetHttp "house-help-budget/backend/internal/modules/staffbudget/http"
	staffbudgetMongo "house-help-budget/backend/internal/modules/staffbudget/storage/mongodb"
	platformMongo "house-help-budget/backend/internal/platform/db/mongodb"
	platformHttp "house-help-budget/backend/internal/platform/http"
)

func main() {
	cfg := config.Load()

	fmt.Printf("🏡 HouseHub Modular Backend API\n")
	fmt.Printf("   Environment: %s\n", cfg.AppEnv)
	fmt.Printf("   Database:    %s\n", cfg.Database)
	fmt.Printf("   Port:        %s\n", cfg.Port)

	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	database, err := platformMongo.Connect(ctx, cfg.MongoURI, cfg.Database)
	if err != nil {
		log.Fatalf("Database connection error: %v", err)
	}
	defer func() {
		closeCtx, closeCancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer closeCancel()
		_ = database.Close(closeCtx)
	}()

	sbStaffRepo := staffbudgetMongo.NewStaffRepository(database.DB)
	sbAttendanceRepo := staffbudgetMongo.NewAttendanceRepository(database.DB)
	sbAdjRepo := staffbudgetMongo.NewAdjustmentRepository(database.DB)
	staffBudgetHandler := staffbudgetHttp.NewStaffBudgetHandler(sbStaffRepo, sbAttendanceRepo, sbAdjRepo)

	mpMealRepo := mealplannerMongo.NewMealRepository(database.DB)
	mpDishRepo := mealplannerMongo.NewDishRepository(database.DB)
	mpRoutineRepo := mealplannerMongo.NewRoutineRepository(database.DB)
	mpSlotRepo := mealplannerMongo.NewSlotConfigRepository(database.DB)
	mealPlannerHandler := mealplannerHttp.NewMealPlannerHandler(mpMealRepo, mpDishRepo, mpRoutineRepo, mpSlotRepo)

	router := platformHttp.NewRouter(
		staffBudgetHandler,
		mealPlannerHandler,
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
