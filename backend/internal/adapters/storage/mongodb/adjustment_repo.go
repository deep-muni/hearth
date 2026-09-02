package mongodb

import (
	"context"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"

	"house-help-budget/backend/internal/core/domain"
	"house-help-budget/backend/internal/core/ports"
)

type AdjustmentRepository struct {
	collection *mongo.Collection
}

func NewAdjustmentRepository(db *mongo.Database) ports.AdjustmentRepository {
	return &AdjustmentRepository{
		collection: db.Collection("adjustments"),
	}
}

func (r *AdjustmentRepository) GetByMonth(ctx context.Context, month string, helperID string) ([]domain.MonthlyAdjustment, error) {
	filter := bson.M{}
	if month != "" {
		filter["month"] = month
	}
	if helperID != "" {
		filter["helperId"] = helperID
	}

	cursor, err := r.collection.Find(ctx, filter)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var adjustments []domain.MonthlyAdjustment
	if err := cursor.All(ctx, &adjustments); err != nil {
		return nil, err
	}
	if adjustments == nil {
		adjustments = []domain.MonthlyAdjustment{}
	}
	return adjustments, nil
}

func (r *AdjustmentRepository) Upsert(ctx context.Context, adj domain.MonthlyAdjustment) (*domain.MonthlyAdjustment, error) {
	filter := bson.M{
		"helperId": adj.HelperID,
		"month":    adj.Month,
	}

	opts := options.UpdateOne().SetUpsert(true)
	update := bson.M{"$set": adj}

	_, err := r.collection.UpdateOne(ctx, filter, update, opts)
	if err != nil {
		return nil, err
	}

	return &adj, nil
}
