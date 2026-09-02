package mongodb

import (
	"context"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"

	"house-help-budget/backend/internal/core/domain"
	"house-help-budget/backend/internal/core/ports"
)

type BackupRepository struct {
	helpers     *mongo.Collection
	attendance  *mongo.Collection
	adjustments *mongo.Collection
}

func NewBackupRepository(db *mongo.Database) ports.BackupRepository {
	return &BackupRepository{
		helpers:     db.Collection("helpers"),
		attendance:  db.Collection("attendance"),
		adjustments: db.Collection("adjustments"),
	}
}

func (r *BackupRepository) ExportAll(ctx context.Context) (*domain.BackupData, error) {
	hCursor, err := r.helpers.Find(ctx, bson.M{})
	if err != nil {
		return nil, err
	}
	defer hCursor.Close(ctx)

	var helpers []domain.HouseHelp
	if err := hCursor.All(ctx, &helpers); err != nil {
		return nil, err
	}
	if helpers == nil {
		helpers = []domain.HouseHelp{}
	}

	attCursor, err := r.attendance.Find(ctx, bson.M{})
	if err != nil {
		return nil, err
	}
	defer attCursor.Close(ctx)

	var attendance []domain.AttendanceRecord
	if err := attCursor.All(ctx, &attendance); err != nil {
		return nil, err
	}
	if attendance == nil {
		attendance = []domain.AttendanceRecord{}
	}

	adjCursor, err := r.adjustments.Find(ctx, bson.M{})
	if err != nil {
		return nil, err
	}
	defer adjCursor.Close(ctx)

	var adjustments []domain.MonthlyAdjustment
	if err := adjCursor.All(ctx, &adjustments); err != nil {
		return nil, err
	}
	if adjustments == nil {
		adjustments = []domain.MonthlyAdjustment{}
	}

	return &domain.BackupData{
		Helpers:     helpers,
		Attendance:  attendance,
		Adjustments: adjustments,
	}, nil
}

func (r *BackupRepository) ImportAll(ctx context.Context, data domain.BackupData) error {
	_, _ = r.helpers.DeleteMany(ctx, bson.M{})
	_, _ = r.attendance.DeleteMany(ctx, bson.M{})
	_, _ = r.adjustments.DeleteMany(ctx, bson.M{})

	if len(data.Helpers) > 0 {
		var docs []any
		for _, h := range data.Helpers {
			docs = append(docs, h)
		}
		if _, err := r.helpers.InsertMany(ctx, docs); err != nil {
			return err
		}
	}

	if len(data.Attendance) > 0 {
		var docs []any
		for _, a := range data.Attendance {
			docs = append(docs, a)
		}
		if _, err := r.attendance.InsertMany(ctx, docs); err != nil {
			return err
		}
	}

	if len(data.Adjustments) > 0 {
		var docs []any
		for _, adj := range data.Adjustments {
			docs = append(docs, adj)
		}
		if _, err := r.adjustments.InsertMany(ctx, docs); err != nil {
			return err
		}
	}

	return nil
}
