package mongodb

import (
	"context"
	"fmt"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

type Database struct {
	Client *mongo.Client
	DB     *mongo.Database
}

func Connect(ctx context.Context, uri, dbName string) (*Database, error) {
	clientOpts := options.Client().ApplyURI(uri)
	client, err := mongo.Connect(clientOpts)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to mongodb: %w", err)
	}

	pingCtx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	if err := client.Ping(pingCtx, nil); err != nil {
		return nil, fmt.Errorf("failed to ping mongodb at %s: %w", uri, err)
	}

	database := client.Database(dbName)
	d := &Database{
		Client: client,
		DB:     database,
	}

	if err := d.ensureIndexes(ctx); err != nil {
		return nil, fmt.Errorf("failed to ensure indexes: %w", err)
	}

	return d, nil
}

func (d *Database) Close(ctx context.Context) error {
	return d.Client.Disconnect(ctx)
}

func (d *Database) ensureIndexes(ctx context.Context) error {
	idxCtx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	createIdx := func(colName string, keys bson.D, unique bool) {
		opts := options.Index()
		if unique {
			opts.SetUnique(true)
		}
		_, _ = d.DB.Collection(colName).Indexes().CreateOne(idxCtx, mongo.IndexModel{
			Keys:    keys,
			Options: opts,
		})
	}

	createIdx("staff", bson.D{{Key: "id", Value: 1}}, true)
	createIdx("staff_attendance", bson.D{{Key: "staffId", Value: 1}, {Key: "date", Value: 1}}, true)
	createIdx("salary_adjustments", bson.D{{Key: "staffId", Value: 1}, {Key: "month", Value: 1}}, true)

	mealsCol := d.DB.Collection("meals")
	_, err := mealsCol.Indexes().CreateOne(idxCtx, mongo.IndexModel{
		Keys:    bson.D{{Key: "date", Value: 1}},
		Options: options.Index().SetUnique(true),
	})
	if err != nil {
		return err
	}

	dishesCol := d.DB.Collection("dishes")
	_, err = dishesCol.Indexes().CreateOne(idxCtx, mongo.IndexModel{
		Keys:    bson.D{{Key: "id", Value: 1}},
		Options: options.Index().SetUnique(true),
	})
	if err != nil {
		return err
	}

	routineCol := d.DB.Collection("meal_routine")
	_, err = routineCol.Indexes().CreateOne(idxCtx, mongo.IndexModel{
		Keys:    bson.D{{Key: "id", Value: 1}},
		Options: options.Index().SetUnique(true),
	})
	if err != nil {
		return err
	}

	slotsCol := d.DB.Collection("meal_slots")
	_, err = slotsCol.Indexes().CreateOne(idxCtx, mongo.IndexModel{
		Keys:    bson.D{{Key: "id", Value: 1}},
		Options: options.Index().SetUnique(true),
	})
	if err != nil {
		return err
	}

	return nil
}
