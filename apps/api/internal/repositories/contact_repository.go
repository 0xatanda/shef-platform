package repositories

import (
	"context"

	"github.com/0xatanda/shef-platform/internal/models"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type ContactRepository struct {
	db *gorm.DB
}

func NewContactRepository(db *gorm.DB) *ContactRepository {
	return &ContactRepository{
		db: db,
	}
}

func (r *ContactRepository) Create(
	ctx context.Context,
	contact *models.Contact,
) error {
	return r.db.
		WithContext(ctx).
		Create(contact).
		Error
}

func (r *ContactRepository) FindByID(
	ctx context.Context,
	id uuid.UUID,
) (*models.Contact, error) {

	var contact models.Contact

	err := r.db.
		WithContext(ctx).
		First(&contact, "id = ?", id).
		Error

	if err != nil {
		return nil, err
	}

	return &contact, nil
}

func (r *ContactRepository) List(
	ctx context.Context,
	page int,
	limit int,
) ([]models.Contact, int64, error) {

	var contacts []models.Contact
	var total int64

	offset := (page - 1) * limit

	if err := r.db.
		WithContext(ctx).
		Model(&models.Contact{}).
		Count(&total).
		Error; err != nil {
		return nil, 0, err
	}

	err := r.db.
		WithContext(ctx).
		Order("created_at DESC").
		Offset(offset).
		Limit(limit).
		Find(&contacts).
		Error

	if err != nil {
		return nil, 0, err
	}

	return contacts, total, nil
}

func (r *ContactRepository) MarkAsRead(
	ctx context.Context,
	id uuid.UUID,
) error {

	return r.db.
		WithContext(ctx).
		Model(&models.Contact{}).
		Where("id = ?", id).
		Update("status", models.ContactRead).
		Error
}

func (r *ContactRepository) Delete(
	ctx context.Context,
	id uuid.UUID,
) error {

	return r.db.
		WithContext(ctx).
		Delete(&models.Contact{}, "id = ?", id).
		Error
}
