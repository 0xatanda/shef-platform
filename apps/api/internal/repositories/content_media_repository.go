package repositories

import (
	"context"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/0xatanda/shef-platform/internal/models"
)

type ContentMediaRepository struct {
	db *gorm.DB
}

func NewContentMediaRepository(db *gorm.DB) *ContentMediaRepository {
	return &ContentMediaRepository{db: db}
}

func (r *ContentMediaRepository) Create(
	ctx context.Context,
	media *models.ContentMedia,
) error {
	return r.db.WithContext(ctx).Create(media).Error
}

func (r *ContentMediaRepository) FindByID(
	ctx context.Context,
	id uuid.UUID,
) (*models.ContentMedia, error) {
	var media models.ContentMedia

	err := r.db.
		WithContext(ctx).
		Where("id = ?", id).
		First(&media).Error

	if err != nil {
		return nil, err
	}

	return &media, nil
}

func (r *ContentMediaRepository) Update(
	ctx context.Context,
	media *models.ContentMedia,
) error {
	return r.db.
		WithContext(ctx).
		Save(media).Error
}

func (r *ContentMediaRepository) Delete(
	ctx context.Context,
	id uuid.UUID,
) error {
	return r.db.
		WithContext(ctx).
		Delete(&models.ContentMedia{}, id).Error
}

func (r *ContentMediaRepository) List(
	ctx context.Context,
	page int,
	limit int,
	mediaType string,
) ([]models.ContentMedia, int64, error) {
	var media []models.ContentMedia
	var total int64

	query := r.db.
		WithContext(ctx).
		Model(&models.ContentMedia{})

	if mediaType != "" {
		query = query.Where("type = ?", mediaType)
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * limit

	if err := query.
		Order("created_at DESC").
		Offset(offset).
		Limit(limit).
		Find(&media).Error; err != nil {
		return nil, 0, err
	}

	return media, total, nil
}
