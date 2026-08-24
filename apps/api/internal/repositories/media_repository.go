package repositories

import (
	"context"

	"github.com/0xatanda/shef-platform/internal/models"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type MediaRepository struct {
	db *gorm.DB
}

func NewMediaRepository(db *gorm.DB) *MediaRepository {
	return &MediaRepository{
		db: db,
	}
}

func (r *MediaRepository) Create(
	ctx context.Context,
	media *models.Media,
) error {

	return r.db.
		Debug().
		WithContext(ctx).
		Create(media).
		Error
}

func (r *MediaRepository) FindByID(
	ctx context.Context,
	id uuid.UUID,
) (*models.Media, error) {

	var media models.Media

	err := r.db.
		WithContext(ctx).
		First(&media, "id = ?", id).
		Error

	if err != nil {
		return nil, err
	}

	return &media, nil
}

func (r *MediaRepository) List(
	ctx context.Context,
	page int,
	limit int,
) ([]models.Media, int64, error) {

	var media []models.Media
	var total int64

	query := r.db.
		WithContext(ctx).
		Model(&models.Media{})

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	err := query.
		Offset((page - 1) * limit).
		Limit(limit).
		Order("created_at DESC").
		Find(&media).
		Error

	if err != nil {
		return nil, 0, err
	}

	return media, total, nil
}

func (r *MediaRepository) Delete(
	ctx context.Context,
	id uuid.UUID,
) error {

	return r.db.
		WithContext(ctx).
		Delete(&models.Media{}, "id = ?", id).
		Error
}
