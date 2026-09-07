package repositories

import (
	"context"

	"github.com/0xatanda/shef-platform/internal/models"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type ProjectMediaRepository struct {
	db *gorm.DB
}

func NewProjectMediaRepository(db *gorm.DB) *ProjectMediaRepository {
	return &ProjectMediaRepository{
		db: db,
	}
}

func (r *ProjectMediaRepository) Create(
	ctx context.Context,
	projectMedia *models.ProjectMedia,
) error {
	return r.db.
		WithContext(ctx).
		Create(projectMedia).
		Error
}

func (r *ProjectMediaRepository) ListByProjectID(
	ctx context.Context,
	projectID uuid.UUID,
) ([]models.ProjectMedia, error) {
	var media []models.ProjectMedia

	err := r.db.
		WithContext(ctx).
		Preload("Media").
		Where("project_id = ?", projectID).
		Order("sort_order ASC").
		Find(&media).
		Error

	if err != nil {
		return nil, err
	}

	return media, nil
}

func (r *ProjectMediaRepository) FindByID(
	ctx context.Context,
	id uuid.UUID,
) (*models.ProjectMedia, error) {
	var media models.ProjectMedia

	err := r.db.
		WithContext(ctx).
		Preload("Media").
		First(&media, "id = ?", id).
		Error

	if err != nil {
		return nil, err
	}

	return &media, nil
}

func (r *ProjectMediaRepository) Delete(
	ctx context.Context,
	id uuid.UUID,
) error {
	return r.db.
		WithContext(ctx).
		Delete(&models.ProjectMedia{}, "id = ?", id).
		Error
}

func (r *ProjectMediaRepository) ClearFeatured(
	ctx context.Context,
	projectID uuid.UUID,
) error {
	return r.db.
		WithContext(ctx).
		Model(&models.ProjectMedia{}).
		Where("project_id = ?", projectID).
		Update("is_featured", false).
		Error
}

func (r *ProjectMediaRepository) SetFeatured(
	ctx context.Context,
	id uuid.UUID,
) error {
	return r.db.
		WithContext(ctx).
		Model(&models.ProjectMedia{}).
		Where("id = ?", id).
		Update("is_featured", true).
		Error
}

func (r *ProjectMediaRepository) UpdateOrder(
	ctx context.Context,
	id uuid.UUID,
	sortOrder int,
) error {
	return r.db.
		WithContext(ctx).
		Model(&models.ProjectMedia{}).
		Where("id = ?", id).
		Update("sort_order", sortOrder).
		Error
}

func (r *ProjectMediaRepository) Exists(
	ctx context.Context,
	projectID uuid.UUID,
	mediaID uuid.UUID,
) (bool, error) {
	var count int64

	err := r.db.
		WithContext(ctx).
		Model(&models.ProjectMedia{}).
		Where(
			"project_id = ? AND media_id = ?",
			projectID,
			mediaID,
		).
		Count(&count).
		Error

	if err != nil {
		return false, err
	}

	return count > 0, nil
}
