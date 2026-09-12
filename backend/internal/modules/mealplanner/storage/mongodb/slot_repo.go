package mongodb

import (
	"context"
	"errors"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"

	"house-help-budget/backend/internal/modules/mealplanner/domain"
	"house-help-budget/backend/internal/modules/mealplanner/ports"
)

type SlotConfigRepository struct {
	col *mongo.Collection
}

func NewSlotConfigRepository(db *mongo.Database) ports.SlotConfigRepository {
	return &SlotConfigRepository{
		col: db.Collection("meal_slots"),
	}
}

type slotDoc struct {
	ID          string `bson:"id"`
	Name        string `bson:"name"`
	DefaultTime string `bson:"defaultTime,omitempty"`
	IsEnabled   bool   `bson:"isEnabled"`
	Order       int    `bson:"order"`
}

func (r *SlotConfigRepository) GetAll(ctx context.Context) ([]domain.MealSlotConfig, error) {
	opts := options.Find().SetSort(bson.D{{Key: "order", Value: 1}, {Key: "name", Value: 1}})
	cursor, err := r.col.Find(ctx, bson.M{"id": bson.M{"$ne": "default"}}, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var configs []domain.MealSlotConfig
	if err := cursor.All(ctx, &configs); err != nil {
		return nil, err
	}
	if len(configs) > 0 {
		return configs, nil
	}

	// Read the old single-document shape so existing installations migrate on save.
	var legacy struct {
		Slots []domain.MealSlotConfig `bson:"slots"`
	}
	err = r.col.FindOne(ctx, bson.M{"id": "default"}).Decode(&legacy)
	if err != nil && !errors.Is(err, mongo.ErrNoDocuments) {
		return nil, err
	}
	if legacy.Slots == nil {
		return []domain.MealSlotConfig{}, nil
	}
	return legacy.Slots, nil
}

func (r *SlotConfigRepository) SaveAll(ctx context.Context, configs []domain.MealSlotConfig) error {
	if _, err := r.col.DeleteOne(ctx, bson.M{"id": "default"}); err != nil {
		return err
	}

	ids := make([]string, 0, len(configs))
	for _, config := range configs {
		ids = append(ids, config.ID)
		doc := slotDoc{
			ID:          config.ID,
			Name:        config.Name,
			DefaultTime: config.DefaultTime,
			IsEnabled:   config.IsEnabled,
			Order:       config.Order,
		}
		_, err := r.col.UpdateOne(
			ctx,
			bson.M{"id": config.ID},
			bson.M{
				"$set":   doc,
				"$unset": bson.M{"iconEmoji": "", "icon": ""},
			},
			options.UpdateOne().SetUpsert(true),
		)
		if err != nil {
			return err
		}
	}

	filter := bson.M{}
	if len(ids) == 0 {
		filter = bson.M{}
	} else {
		filter = bson.M{"id": bson.M{"$nin": ids}}
	}
	_, err := r.col.DeleteMany(ctx, filter)
	return err
}
