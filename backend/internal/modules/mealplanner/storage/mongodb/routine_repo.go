package mongodb

import (
	"context"
	"errors"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"

	"hearth/backend/internal/modules/mealplanner/domain"
	"hearth/backend/internal/modules/mealplanner/ports"
)

type RoutineRepository struct {
	col *mongo.Collection
}

func NewRoutineRepository(db *mongo.Database) ports.RoutineRepository {
	return &RoutineRepository{
		col: db.Collection("meal_routine"),
	}
}

type routineDoc struct {
	ID      string               `bson:"id"`
	Routine domain.WeeklyRoutine `bson:"routine"`
}

func (r *RoutineRepository) Get(ctx context.Context) (domain.WeeklyRoutine, error) {
	var doc routineDoc
	err := r.col.FindOne(ctx, bson.M{"id": "default"}).Decode(&doc)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return domain.WeeklyRoutine{}, nil
		}
		return nil, err
	}
	if doc.Routine == nil {
		return domain.WeeklyRoutine{}, nil
	}
	return doc.Routine, nil
}

func (r *RoutineRepository) Save(ctx context.Context, routine domain.WeeklyRoutine) error {
	opts := options.UpdateOne().SetUpsert(true)
	doc := routineDoc{
		ID:      "default",
		Routine: routine,
	}
	_, err := r.col.UpdateOne(
		ctx,
		bson.M{"id": "default"},
		bson.M{"$set": doc},
		opts,
	)
	return err
}
