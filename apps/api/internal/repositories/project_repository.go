package repositories

import (
	"context"
	"errors"
	"log"

	"github.com/0xatanda/shef-platform/internal/models"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type ProjectRepository struct {
	db *gorm.DB
}

func NewProjectRepository(db *gorm.DB) *ProjectRepository {
	return &ProjectRepository{
		db: db,
	}
}

func (r *ProjectRepository) Create(
	ctx context.Context,
	project *models.Project,
) error {

	return r.db.WithContext(ctx).
		Create(project).
		Error
}

func (r *ProjectRepository) Update(
	ctx context.Context,
	project *models.Project,
) error {

	result := r.db.
		WithContext(ctx).
		Save(project)

	log.Printf("Rows affected: %d\n", result.RowsAffected)

	return result.Error
}

func (r *ProjectRepository) Delete(
	ctx context.Context,
	id uuid.UUID,
) error {

	return r.db.WithContext(ctx).
		Delete(&models.Project{}, id).
		Error
}

func (r *ProjectRepository) FindBySlug(
	ctx context.Context,
	slug string,
) (*models.Project, error) {

	var project models.Project

	err := r.db.WithContext(ctx).
		Where("slug = ?", slug).
		First(&project).
		Error

	if err != nil {
		return nil, err
	}

	return &project, nil
}

func (r *ProjectRepository) ExistsBySlug(
	ctx context.Context,
	slug string,
) (bool, error) {

	var count int64

	err := r.db.WithContext(ctx).
		Model(&models.Project{}).
		Where("slug = ?", slug).
		Count(&count).
		Error

	if err != nil {
		return false, err
	}

	return count > 0, nil
}

func (r *ProjectRepository) List(
	ctx context.Context,
	page int,
	limit int,
	search string,
	status string,
) ([]models.Project, int64, error) {

	var projects []models.Project
	var total int64

	query := r.db.WithContext(ctx).Model(&models.Project{})

	if search != "" {
		query = query.Where(
			"title ILIKE ? OR summary ILIKE ?",
			"%"+search+"%",
			"%"+search+"%",
		)
	}

	if status != "" {
		query = query.Where("status = ?", status)
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * limit

	err := query.
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&projects).Error

	return projects, total, err
}

func (r *ProjectRepository) FindByID(
	ctx context.Context,
	id uuid.UUID,
) (*models.Project, error) {

	var project models.Project

	err := r.db.
		WithContext(ctx).
		Where("id = ?", id).
		First(&project).
		Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, gorm.ErrRecordNotFound
		}

		return nil, err
	}

	return &project, nil
}

func (r *ProjectRepository) Restore(
	ctx context.Context,
	id uuid.UUID,
) error {

	return r.db.
		WithContext(ctx).
		Unscoped().
		Model(&models.Project{}).
		Where("id = ?", id).
		Update("deleted_at", nil).
		Error
}

func (r *ProjectRepository) PermanentDelete(
	ctx context.Context,
	id uuid.UUID,
) error {

	return r.db.
		WithContext(ctx).
		Unscoped().
		Delete(&models.Project{}, "id = ?", id).
		Error
}

func (r *ProjectRepository) ListDeleted(
	ctx context.Context,
	page int,
	limit int,
	search string,
) ([]models.Project, int64, error) {

	var projects []models.Project
	var total int64

	query := r.db.
		WithContext(ctx).
		Unscoped().
		Model(&models.Project{}).
		Where("deleted_at IS NOT NULL")

	if search != "" {
		query = query.Where(
			"title ILIKE ?",
			"%"+search+"%",
		)
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	err := query.
		Offset((page - 1) * limit).
		Limit(limit).
		Order("deleted_at DESC").
		Find(&projects).
		Error

	if err != nil {
		return nil, 0, err
	}

	return projects, total, nil
}

func (r *ProjectRepository) FindDeletedByID(
	ctx context.Context,
	id uuid.UUID,
) (*models.Project, error) {

	var project models.Project

	err := r.db.
		WithContext(ctx).
		Unscoped().
		Where("id = ? AND deleted_at IS NOT NULL", id).
		First(&project).
		Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, gorm.ErrRecordNotFound
		}

		return nil, err
	}

	return &project, nil
}

func (r *ProjectRepository) ExistsBySlugExceptID(
	ctx context.Context,
	slug string,
	id uuid.UUID,
) (bool, error) {

	var count int64

	err := r.db.
		WithContext(ctx).
		Model(&models.Project{}).
		Where("slug = ? AND id <> ?", slug, id).
		Count(&count).
		Error

	if err != nil {
		return false, err
	}

	return count > 0, nil
}
