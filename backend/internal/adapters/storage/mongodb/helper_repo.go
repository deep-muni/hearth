package mongodb

import (
	"context"
	"errors"
	"time"

	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"

	"house-help-budget/backend/internal/core/domain"
	"house-help-budget/backend/internal/core/ports"
)

type HelperRepository struct {
	collection  *mongo.Collection
	attendance  *mongo.Collection
	adjustments *mongo.Collection
}

func NewHelperRepository(db *mongo.Database) ports.HelperRepository {
	return &HelperRepository{
		collection:  db.Collection("helpers"),
		attendance:  db.Collection("attendance"),
		adjustments: db.Collection("adjustments"),
	}
}

func (r *HelperRepository) GetAll(ctx context.Context, includeInactive bool) ([]domain.HouseHelp, error) {
	filter := bson.M{}
	if !includeInactive {
		filter["isActive"] = true
	}

	opts := options.Find().SetSort(bson.D{{Key: "name", Value: 1}})
	cursor, err := r.collection.Find(ctx, filter, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var helpers []domain.HouseHelp
	if err := cursor.All(ctx, &helpers); err != nil {
		return nil, err
	}
	if helpers == nil {
		helpers = []domain.HouseHelp{}
	}
	return helpers, nil
}

func (r *HelperRepository) GetByID(ctx context.Context, id string) (*domain.HouseHelp, error) {
	var helper domain.HouseHelp
	err := r.collection.FindOne(ctx, bson.M{"id": id}).Decode(&helper)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, nil
		}
		return nil, err
	}
	return &helper, nil
}

func (r *HelperRepository) Save(ctx context.Context, helper domain.HouseHelp) (*domain.HouseHelp, error) {
	if helper.ID == "" {
		helper.ID = "h_" + uuid.New().String()[:8]
		helper.CreatedAt = time.Now().UTC().Format(time.RFC3339)
	}

	opts := options.UpdateOne().SetUpsert(true)
	filter := bson.M{"id": helper.ID}
	update := bson.M{"$set": helper}

	_, err := r.collection.UpdateOne(ctx, filter, update, opts)
	if err != nil {
		return nil, err
	}

	return &helper, nil
}

func (r *HelperRepository) SoftDelete(ctx context.Context, id string, leftDate string) error {
	if leftDate == "" {
		leftDate = time.Now().UTC().Format("2006-01")
	}

	update := bson.M{
		"$set": bson.M{
			"isActive": false,
			"leftDate": leftDate,
		},
	}

	res, err := r.collection.UpdateOne(ctx, bson.M{"id": id}, update)
	if err != nil {
		return err
	}
	if res.MatchedCount == 0 {
		return errors.New("helper not found")
	}
	return nil
}

func (r *HelperRepository) Restore(ctx context.Context, id string) error {
	update := bson.M{
		"$set": bson.M{
			"isActive": true,
		},
		"$unset": bson.M{
			"leftDate": "",
		},
	}

	res, err := r.collection.UpdateOne(ctx, bson.M{"id": id}, update)
	if err != nil {
		return err
	}
	if res.MatchedCount == 0 {
		return errors.New("helper not found")
	}
	return nil
}

func (r *HelperRepository) HardDelete(ctx context.Context, id string) error {
	_, err := r.collection.DeleteOne(ctx, bson.M{"id": id})
	if err != nil {
		return err
	}

	_, _ = r.attendance.DeleteMany(ctx, bson.M{"helperId": id})
	_, _ = r.adjustments.DeleteMany(ctx, bson.M{"helperId": id})

	return nil
}
