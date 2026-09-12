package mongodb

import (
	"context"
	"errors"
	"time"

	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"

	"hearth/backend/internal/modules/staffbudget/domain"
	"hearth/backend/internal/modules/staffbudget/ports"
)

type StaffRepository struct {
	col *mongo.Collection
}

func NewStaffRepository(db *mongo.Database) ports.StaffRepository {
	return &StaffRepository{
		col: db.Collection("staff"),
	}
}

func (r *StaffRepository) GetAll(ctx context.Context, includeInactive bool) ([]domain.StaffMember, error) {
	filter := bson.M{}
	if !includeInactive {
		filter["isActive"] = true
	}

	opts := options.Find().SetSort(bson.D{{Key: "name", Value: 1}})
	cursor, err := r.col.Find(ctx, filter, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var staffList []domain.StaffMember
	if err := cursor.All(ctx, &staffList); err != nil {
		return nil, err
	}

	if staffList == nil {
		staffList = []domain.StaffMember{}
	}

	return staffList, nil
}

func (r *StaffRepository) GetByID(ctx context.Context, id string) (*domain.StaffMember, error) {
	var staff domain.StaffMember
	err := r.col.FindOne(ctx, bson.M{"id": id}).Decode(&staff)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, nil
		}
		return nil, err
	}
	return &staff, nil
}

func (r *StaffRepository) Save(ctx context.Context, staff domain.StaffMember) (*domain.StaffMember, error) {
	if staff.ID == "" {
		staff.ID = "staff_" + uuid.New().String()[:8]
		staff.CreatedAt = time.Now().UTC().Format(time.RFC3339)
	}

	opts := options.UpdateOne().SetUpsert(true)
	_, err := r.col.UpdateOne(
		ctx,
		bson.M{"id": staff.ID},
		bson.M{"$set": staff},
		opts,
	)
	if err != nil {
		return nil, err
	}

	return &staff, nil
}

func (r *StaffRepository) SoftDelete(ctx context.Context, id string, leftDate string) error {
	if leftDate == "" {
		leftDate = time.Now().UTC().Format("2006-01")
	}

	update := bson.M{
		"$set": bson.M{
			"isActive": false,
			"leftDate": leftDate,
		},
	}

	res, err := r.col.UpdateOne(ctx, bson.M{"id": id}, update)
	if err != nil {
		return err
	}
	if res.MatchedCount == 0 {
		return errors.New("staff member not found")
	}
	return nil
}

func (r *StaffRepository) Restore(ctx context.Context, id string) error {
	update := bson.M{
		"$set": bson.M{
			"isActive": true,
		},
		"$unset": bson.M{
			"leftDate": "",
		},
	}

	res, err := r.col.UpdateOne(ctx, bson.M{"id": id}, update)
	if err != nil {
		return err
	}
	if res.MatchedCount == 0 {
		return errors.New("staff member not found")
	}
	return nil
}

func (r *StaffRepository) HardDelete(ctx context.Context, id string) error {
	_, err := r.col.DeleteOne(ctx, bson.M{"id": id})
	return err
}
