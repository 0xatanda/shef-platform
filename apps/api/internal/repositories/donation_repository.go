package repositories

import (
	"context"

	"github.com/0xatanda/shef-platform/internal/models"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type DonationRepository struct {
	db *gorm.DB
}

func NewDonationRepository(db *gorm.DB) *DonationRepository {
	return &DonationRepository{
		db: db,
	}
}

func (r *DonationRepository) Create(
	ctx context.Context,
	donation *models.Donation,
) error {

	return r.db.
		WithContext(ctx).
		Create(donation).
		Error
}

func (r *DonationRepository) FindByID(
	ctx context.Context,
	id uuid.UUID,
) (*models.Donation, error) {

	var donation models.Donation

	err := r.db.
		WithContext(ctx).
		First(&donation, "id = ?", id).
		Error

	if err != nil {
		return nil, err
	}

	return &donation, nil
}

func (r *DonationRepository) List(
	ctx context.Context,
	page int,
	limit int,
) ([]models.Donation, int64, error) {

	var donations []models.Donation
	var total int64

	offset := (page - 1) * limit

	if err := r.db.
		WithContext(ctx).
		Model(&models.Donation{}).
		Count(&total).
		Error; err != nil {
		return nil, 0, err
	}

	err := r.db.
		WithContext(ctx).
		Order("created_at DESC").
		Offset(offset).
		Limit(limit).
		Find(&donations).
		Error

	if err != nil {
		return nil, 0, err
	}

	return donations, total, nil
}

func (r *DonationRepository) Update(
	ctx context.Context,
	donation *models.Donation,
) error {

	return r.db.
		WithContext(ctx).
		Save(donation).
		Error
}

func (r *DonationRepository) Delete(
	ctx context.Context,
	id uuid.UUID,
) error {

	return r.db.
		WithContext(ctx).
		Delete(&models.Donation{}, "id = ?", id).
		Error
}
