package repositories

import (
	"context"

	"github.com/0xatanda/shef-platform/internal/models"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type SiteContentRepository struct {
	db *gorm.DB
}

func NewSiteContentRepository(db *gorm.DB) *SiteContentRepository {
	return &SiteContentRepository{
		db: db,
	}
}

func (r *SiteContentRepository) Create(
	ctx context.Context,
	content *models.SiteContent,
) error {
	return r.db.
		WithContext(ctx).
		Create(content).
		Error
}

func (r *SiteContentRepository) FindByID(
	ctx context.Context,
	id uuid.UUID,
) (*models.SiteContent, error) {

	var content models.SiteContent

	err := r.db.
		WithContext(ctx).
		First(&content, "id = ?", id).
		Error

	if err != nil {
		return nil, err
	}

	return &content, nil
}

func (r *SiteContentRepository) FindByKey(
	ctx context.Context,
	key string,
) (*models.SiteContent, error) {

	var content models.SiteContent

	err := r.db.
		WithContext(ctx).
		Where("key = ?", key).
		First(&content).
		Error

	if err != nil {
		return nil, err
	}

	return &content, nil
}

func (r *SiteContentRepository) List(
	ctx context.Context,
	page int,
	limit int,
) ([]models.SiteContent, int64, error) {

	var contents []models.SiteContent
	var total int64

	offset := (page - 1) * limit

	if err := r.db.
		WithContext(ctx).
		Model(&models.SiteContent{}).
		Count(&total).
		Error; err != nil {
		return nil, 0, err
	}

	err := r.db.
		WithContext(ctx).
		Order("created_at DESC").
		Offset(offset).
		Limit(limit).
		Find(&contents).
		Error

	if err != nil {
		return nil, 0, err
	}

	return contents, total, nil
}

func (r *SiteContentRepository) Update(
	ctx context.Context,
	content *models.SiteContent,
) error {

	return r.db.
		WithContext(ctx).
		Save(content).
		Error
}

func (r *SiteContentRepository) Delete(
	ctx context.Context,
	id uuid.UUID,
) error {

	return r.db.
		WithContext(ctx).
		Delete(&models.SiteContent{}, "id = ?", id).
		Error
}
