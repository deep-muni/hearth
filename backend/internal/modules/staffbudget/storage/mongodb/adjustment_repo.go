package mongodb

import (
	"context"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"

	"hearth/backend/internal/modules/staffbudget/domain"
	"hearth/backend/internal/modules/staffbudget/ports"
)

type AdjustmentRepository struct {
	col *mongo.Collection
}

func NewAdjustmentRepository(db *mongo.Database) ports.AdjustmentRepository {
	return &AdjustmentRepository{
		col: db.Collection("salary_adjustments"),
	}
}

func (r *AdjustmentRepository) GetByMonth(ctx context.Context, month string, staffID string) ([]domain.SalaryAdjustment, error) {
	filter := bson.M{}

	if month != "" {
		filter["month"] = month
	}

	if staffID != "" {
		filter["staffId"] = staffID
	}

	cursor, err := r.col.Find(ctx, filter)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var adjustments []domain.SalaryAdjustment
	if err := cursor.All(ctx, &adjustments); err != nil {
		return nil, err
	}

	if adjustments == nil {
		adjustments = []domain.SalaryAdjustment{}
	}

	return adjustments, nil
}

func (r *AdjustmentRepository) Upsert(ctx context.Context, adj domain.SalaryAdjustment) (*domain.SalaryAdjustment, error) {
	filter := bson.M{
		"staffId": adj.StaffID,
		"month":   adj.Month,
	}

	opts := options.UpdateOne().SetUpsert(true)
	_, err := r.col.UpdateOne(
		ctx,
		filter,
		bson.M{"$set": adj},
		opts,
	)
	if err != nil {
		return nil, err
	}

	return &adj, nil
}
