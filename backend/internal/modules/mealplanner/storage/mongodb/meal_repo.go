package mongodb

import (
	"context"
	"errors"
	"time"

	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"

	"house-help-budget/backend/internal/modules/mealplanner/domain"
	"house-help-budget/backend/internal/modules/mealplanner/ports"
)

type MealRepository struct {
	col *mongo.Collection
}

func NewMealRepository(db *mongo.Database) ports.MealRepository {
	return &MealRepository{
		col: db.Collection("meals"),
	}
}

func (r *MealRepository) GetByDate(ctx context.Context, date string) (*domain.DayMenu, error) {
	var menu domain.DayMenu
	err := r.col.FindOne(ctx, bson.M{"date": date}).Decode(&menu)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, nil
		}
		return nil, err
	}
	return &menu, nil
}

func (r *MealRepository) GetByDateRange(ctx context.Context, startDate, endDate string) ([]domain.DayMenu, error) {
	filter := bson.M{}
	if startDate != "" && endDate != "" {
		filter["date"] = bson.M{
			"$gte": startDate,
			"$lte": endDate,
		}
	}

	opts := options.Find().SetSort(bson.D{{Key: "date", Value: 1}})
	cursor, err := r.col.Find(ctx, filter, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var menus []domain.DayMenu
	if err := cursor.All(ctx, &menus); err != nil {
		return nil, err
	}

	if menus == nil {
		menus = []domain.DayMenu{}
	}

	return menus, nil
}

func (r *MealRepository) Save(ctx context.Context, menu domain.DayMenu) (*domain.DayMenu, error) {
	if menu.ID == "" {
		menu.ID = "menu_" + uuid.New().String()[:8]
	}
	menu.UpdatedAt = time.Now().UTC().Format(time.RFC3339)

	opts := options.UpdateOne().SetUpsert(true)
	_, err := r.col.UpdateOne(
		ctx,
		bson.M{"date": menu.Date},
		bson.M{"$set": menu},
		opts,
	)
	if err != nil {
		return nil, err
	}

	return &menu, nil
}

func (r *MealRepository) Delete(ctx context.Context, date string) error {
	_, err := r.col.DeleteOne(ctx, bson.M{"date": date})
	return err
}
