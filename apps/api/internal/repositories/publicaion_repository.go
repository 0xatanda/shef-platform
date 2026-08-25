package repositories

import (
	"context"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/0xatanda/shef-platform/internal/models"
)

type PublicationRepository struct {
	db *gorm.DB
}

func NewPublicationRepository(db *gorm.DB) *PublicationRepository {
	return &PublicationRepository{
		db: db,
	}
}

func (r *PublicationRepository) Create(
	ctx context.Context,
	publication *models.Publication,
) error {
	return r.db.WithContext(ctx).
		Create(publication).
		Error
}

func (r *PublicationRepository) FindByID(
	ctx context.Context,
	id uuid.UUID,
) (*models.Publication, error) {

	var publication models.Publication

	err := r.db.WithContext(ctx).
		Where("id = ?", id).
		First(&publication).
		Error

	if err != nil {
		return nil, err
	}

	return &publication, nil
}

func (r *PublicationRepository) FindBySlug(
	ctx context.Context,
	slug string,
) (*models.Publication, error) {

	var publication models.Publication

	err := r.db.WithContext(ctx).
		Where("slug = ?", slug).
		First(&publication).
		Error

	if err != nil {
		return nil, err
	}

	return &publication, nil
}

func (r *PublicationRepository) List(
	ctx context.Context,
	page int,
	limit int,
) ([]models.Publication, int64, error) {

	var publications []models.Publication
	var total int64

	offset := (page - 1) * limit

	query := r.db.WithContext(ctx).
		Model(&models.Publication{})

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if err := query.
		Order("created_at DESC").
		Offset(offset).
		Limit(limit).
		Find(&publications).
		Error; err != nil {
		return nil, 0, err
	}

	return publications, total, nil
}

func (r *PublicationRepository) Update(
	ctx context.Context,
	publication *models.Publication,
) error {
	return r.db.WithContext(ctx).
		Save(publication).
		Error
}

func (r *PublicationRepository) Delete(
	ctx context.Context,
	id uuid.UUID,
) error {

	return r.db.WithContext(ctx).
		Delete(&models.Publication{}, id).
		Error
}

func (r *PublicationRepository) Restore(
	ctx context.Context,
	id uuid.UUID,
) error {

	return r.db.WithContext(ctx).
		Unscoped().
		Model(&models.Publication{}).
		Where("id = ?", id).
		Update("deleted_at", nil).
		Error
}

func (r *PublicationRepository) PermanentDelete(
	ctx context.Context,
	id uuid.UUID,
) error {

	return r.db.WithContext(ctx).
		Unscoped().
		Delete(&models.Publication{}, id).
		Error
}

func (r *PublicationRepository) FindDeletedByID(
	ctx context.Context,
	id uuid.UUID,
) (*models.Publication, error) {

	var publication models.Publication

	err := r.db.WithContext(ctx).
		Unscoped().
		Where("id = ?", id).
		Where("deleted_at IS NOT NULL").
		First(&publication).
		Error

	if err != nil {
		return nil, err
	}

	return &publication, nil
}

func (r *PublicationRepository) ExistsBySlug(
	ctx context.Context,
	slug string,
) (bool, error) {

	var count int64

	err := r.db.WithContext(ctx).
		Model(&models.Publication{}).
		Where("slug = ?", slug).
		Count(&count).
		Error

	return count > 0, err
}

func (r *PublicationRepository) ExistsBySlugExceptID(
	ctx context.Context,
	slug string,
	id uuid.UUID,
) (bool, error) {

	var count int64

	err := r.db.WithContext(ctx).
		Model(&models.Publication{}).
		Where("slug = ?", slug).
		Where("id != ?", id).
		Count(&count).
		Error

	return count > 0, err
}

func (r *PublicationRepository) ListDeleted(
	ctx context.Context,
	page int,
	limit int,
) ([]models.Publication, int64, error) {

	var publications []models.Publication
	var total int64

	offset := (page - 1) * limit

	query := r.db.WithContext(ctx).
		Unscoped().
		Model(&models.Publication{}).
		Where("deleted_at IS NOT NULL")

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if err := query.
		Order("deleted_at DESC").
		Offset(offset).
		Limit(limit).
		Find(&publications).
		Error; err != nil {
		return nil, 0, err
	}

	return publications, total, nil
}
