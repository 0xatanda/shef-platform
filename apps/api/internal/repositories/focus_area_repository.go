package repositories

import (
	"context"
	"errors"

	"github.com/0xatanda/shef-platform/internal/models"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type FocusAreaRepository struct {
	db *gorm.DB
}

func NewFocusAreaRepository(db *gorm.DB) *FocusAreaRepository {
	return &FocusAreaRepository{
		db: db,
	}
}

func (r *FocusAreaRepository) List(
	ctx context.Context,
	includeInactive bool,
) ([]models.FocusArea, error) {
	var items []models.FocusArea

	query := r.db.WithContext(ctx).
		Model(&models.FocusArea{})

	if !includeInactive {
		query = query.Where(
			"is_active = ?",
			true,
		)
	}

	if err := query.
		Order("sort_order ASC").
		Order("created_at ASC").
		Find(&items).Error; err != nil {
		return nil, err
	}

	return items, nil
}

func (r *FocusAreaRepository) FindByID(
	ctx context.Context,
	id uuid.UUID,
) (*models.FocusArea, error) {
	var item models.FocusArea

	err := r.db.WithContext(ctx).
		First(&item, "id = ?", id).
		Error

	if err != nil {
		if errors.Is(
			err,
			gorm.ErrRecordNotFound,
		) {
			return nil, gorm.ErrRecordNotFound
		}

		return nil, err
	}

	return &item, nil
}

func (r *FocusAreaRepository) FindBySlug(
	ctx context.Context,
	slug string,
) (*models.FocusArea, error) {
	var item models.FocusArea

	err := r.db.WithContext(ctx).
		Where("slug = ?", slug).
		First(&item).
		Error

	if err != nil {
		if errors.Is(
			err,
			gorm.ErrRecordNotFound,
		) {
			return nil, gorm.ErrRecordNotFound
		}

		return nil, err
	}

	return &item, nil
}

func (r *FocusAreaRepository) Create(
	ctx context.Context,
	focusArea *models.FocusArea,
) error {
	return r.db.WithContext(ctx).
		Create(focusArea).
		Error
}

func (r *FocusAreaRepository) Update(
	ctx context.Context,
	focusArea *models.FocusArea,
) error {
	return r.db.WithContext(ctx).
		Save(focusArea).
		Error
}

func (r *FocusAreaRepository) Delete(
	ctx context.Context,
	id uuid.UUID,
) error {
	return r.db.WithContext(ctx).
		Delete(
			&models.FocusArea{},
			"id = ?",
			id,
		).
		Error
}
