package mongodb

import (
	"context"
	"time"

	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"

	"house-help-budget/backend/internal/modules/staffbudget/domain"
	"house-help-budget/backend/internal/modules/staffbudget/ports"
)

type AttendanceRepository struct {
	col *mongo.Collection
}

func NewAttendanceRepository(db *mongo.Database) ports.AttendanceRepository {
	return &AttendanceRepository{
		col: db.Collection("staff_attendance"),
	}
}

func (r *AttendanceRepository) GetByMonth(ctx context.Context, month string, staffID string) ([]domain.AttendanceRecord, error) {
	filter := bson.M{}

	if month != "" {
		filter["date"] = bson.M{
			"$regex": "^" + month,
		}
	}

	if staffID != "" {
		filter["staffId"] = staffID
	}

	opts := options.Find().SetSort(bson.D{{Key: "date", Value: 1}})
	cursor, err := r.col.Find(ctx, filter, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var records []domain.AttendanceRecord
	if err := cursor.All(ctx, &records); err != nil {
		return nil, err
	}

	if records == nil {
		records = []domain.AttendanceRecord{}
	}

	return records, nil
}

func (r *AttendanceRepository) Upsert(ctx context.Context, record domain.AttendanceRecord) (*domain.AttendanceRecord, error) {
	if record.ID == "" {
		record.ID = "att_" + uuid.New().String()[:8]
	}
	record.UpdatedAt = time.Now().UTC().Format(time.RFC3339)

	filter := bson.M{
		"staffId": record.StaffID,
		"date":    record.Date,
	}

	opts := options.UpdateOne().SetUpsert(true)
	_, err := r.col.UpdateOne(
		ctx,
		filter,
		bson.M{"$set": record},
		opts,
	)
	if err != nil {
		return nil, err
	}

	return &record, nil
}

func (r *AttendanceRepository) Delete(ctx context.Context, staffID string, date string) error {
	filter := bson.M{
		"staffId": staffID,
		"date":    date,
	}
	_, err := r.col.DeleteOne(ctx, filter)
	return err
}
