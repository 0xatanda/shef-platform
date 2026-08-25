package repositories

import (
	"context"

	"github.com/0xatanda/shef-platform/internal/models"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type PartnerRepository struct {
	db *gorm.DB
}

func NewPartnerRepository(db *gorm.DB) *PartnerRepository {
	return &PartnerRepository{
		db: db,
	}
}

func (r *PartnerRepository) Create(
	ctx context.Context,
	partner *models.Partner,
) error {
	return r.db.WithContext(ctx).
		Create(partner).
		Error
}

func (r *PartnerRepository) FindByID(
	ctx context.Context,
	id uuid.UUID,
) (*models.Partner, error) {

	var partner models.Partner

	err := r.db.WithContext(ctx).
		Where("id = ?", id).
		First(&partner).
		Error

	if err != nil {
		return nil, err
	}

	return &partner, nil
}

func (r *PartnerRepository) FindByName(
	ctx context.Context,
	name string,
) (*models.Partner, error) {

	var partner models.Partner

	err := r.db.WithContext(ctx).
		Where("LOWER(name) = LOWER(?)", name).
		First(&partner).
		Error

	if err != nil {
		return nil, err
	}

	return &partner, nil
}

func (r *PartnerRepository) List(
	ctx context.Context,
	page int,
	limit int,
	includeDeleted bool,
) ([]models.Partner, int64, error) {

	var partners []models.Partner
	var total int64

	query := r.db.WithContext(ctx)

	if includeDeleted {
		query = query.Unscoped()
	}

	if err := query.
		Model(&models.Partner{}).
		Count(&total).
		Error; err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * limit

	if err := query.
		Order("display_order ASC, created_at DESC").
		Offset(offset).
		Limit(limit).
		Find(&partners).
		Error; err != nil {
		return nil, 0, err
	}

	return partners, total, nil
}

func (r *PartnerRepository) ListPublic(
	ctx context.Context,
) ([]models.Partner, error) {

	var partners []models.Partner

	err := r.db.WithContext(ctx).
		Where("is_active = ?", true).
		Order("display_order ASC, name ASC").
		Find(&partners).
		Error

	return partners, err
}

func (r *PartnerRepository) Update(
	ctx context.Context,
	partner *models.Partner,
) error {
	return r.db.WithContext(ctx).
		Save(partner).
		Error
}

func (r *PartnerRepository) Delete(
	ctx context.Context,
	id uuid.UUID,
) error {

	return r.db.WithContext(ctx).
		Delete(&models.Partner{}, id).
		Error
}

func (r *PartnerRepository) Restore(
	ctx context.Context,
	id uuid.UUID,
) error {

	result := r.db.WithContext(ctx).
		Unscoped().
		Model(&models.Partner{}).
		Where("id = ?", id).
		Update("deleted_at", nil)

	return result.Error
}

func (r *PartnerRepository) PermanentDelete(
	ctx context.Context,
	id uuid.UUID,
) error {

	return r.db.WithContext(ctx).
		Unscoped().
		Delete(&models.Partner{}, id).
		Error
}

func (r *PartnerRepository) ExistsByName(
	ctx context.Context,
	name string,
) (bool, error) {

	var count int64

	err := r.db.WithContext(ctx).
		Model(&models.Partner{}).
		Where("LOWER(name) = LOWER(?)", name).
		Count(&count).
		Error

	return count > 0, err
}

func (r *PartnerRepository) ExistsByNameExceptID(
	ctx context.Context,
	name string,
	id uuid.UUID,
) (bool, error) {

	var count int64

	err := r.db.WithContext(ctx).
		Model(&models.Partner{}).
		Where(
			"LOWER(name) = LOWER(?) AND id != ?",
			name,
			id,
		).
		Count(&count).
		Error

	return count > 0, err
}
