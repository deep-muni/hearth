package mongodb

import (
	"context"
	"time"

	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"

	"house-help-budget/backend/internal/core/domain"
	"house-help-budget/backend/internal/core/ports"
)

type AttendanceRepository struct {
	collection *mongo.Collection
}

func NewAttendanceRepository(db *mongo.Database) ports.AttendanceRepository {
	return &AttendanceRepository{
		collection: db.Collection("attendance"),
	}
}

func (r *AttendanceRepository) GetByMonth(ctx context.Context, month string, helperID string) ([]domain.AttendanceRecord, error) {
	filter := bson.M{}
	if month != "" {
		filter["date"] = bson.M{
			"$regex": "^" + month,
		}
	}
	if helperID != "" {
		filter["helperId"] = helperID
	}

	opts := options.Find().SetSort(bson.D{{Key: "date", Value: 1}})
	cursor, err := r.collection.Find(ctx, filter, opts)
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
		"helperId": record.HelperID,
		"date":     record.Date,
	}

	opts := options.UpdateOne().SetUpsert(true)
	update := bson.M{"$set": record}

	_, err := r.collection.UpdateOne(ctx, filter, update, opts)
	if err != nil {
		return nil, err
	}

	return &record, nil
}

func (r *AttendanceRepository) Delete(ctx context.Context, helperID string, date string) error {
	filter := bson.M{
		"helperId": helperID,
		"date":     date,
	}
	_, err := r.collection.DeleteOne(ctx, filter)
	return err
}
