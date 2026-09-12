package mongodb

import (
	"context"

	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"

	"hearth/backend/internal/modules/mealplanner/domain"
	"hearth/backend/internal/modules/mealplanner/ports"
)

type DishRepository struct {
	col *mongo.Collection
}

func NewDishRepository(db *mongo.Database) ports.DishRepository {
	return &DishRepository{
		col: db.Collection("dishes"),
	}
}

func (r *DishRepository) GetAll(ctx context.Context) ([]domain.DishSuggestion, error) {
	opts := options.Find().SetSort(bson.D{{Key: "name", Value: 1}})
	cursor, err := r.col.Find(ctx, bson.M{}, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var dishes []domain.DishSuggestion
	if err := cursor.All(ctx, &dishes); err != nil {
		return nil, err
	}

	if dishes == nil {
		dishes = []domain.DishSuggestion{}
	}

	return dishes, nil
}

func (r *DishRepository) Save(ctx context.Context, dish domain.DishSuggestion) (*domain.DishSuggestion, error) {
	if dish.ID == "" {
		dish.ID = "dish_" + uuid.New().String()[:8]
	}

	opts := options.UpdateOne().SetUpsert(true)
	_, err := r.col.UpdateOne(
		ctx,
		bson.M{"id": dish.ID},
		bson.M{"$set": dish},
		opts,
	)
	if err != nil {
		return nil, err
	}

	return &dish, nil
}

func (r *DishRepository) Delete(ctx context.Context, id string) error {
	_, err := r.col.DeleteOne(ctx, bson.M{"id": id})
	return err
}
