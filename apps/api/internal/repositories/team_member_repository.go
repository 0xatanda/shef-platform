package repositories

import (
	"context"

	"github.com/0xatanda/shef-platform/internal/models"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type TeamMemberRepository struct {
	db *gorm.DB
}

func NewTeamMemberRepository(db *gorm.DB) *TeamMemberRepository {
	return &TeamMemberRepository{
		db: db,
	}
}

func (r *TeamMemberRepository) Create(
	ctx context.Context,
	member *models.TeamMember,
) error {
	return r.db.
		WithContext(ctx).
		Create(member).
		Error
}

func (r *TeamMemberRepository) FindByID(
	ctx context.Context,
	id uuid.UUID,
) (*models.TeamMember, error) {

	var member models.TeamMember

	err := r.db.
		WithContext(ctx).
		First(&member, "id = ?", id).
		Error

	if err != nil {
		return nil, err
	}

	return &member, nil
}

func (r *TeamMemberRepository) List(
	ctx context.Context,
	page int,
	limit int,
) ([]models.TeamMember, int64, error) {

	var members []models.TeamMember
	var total int64

	offset := (page - 1) * limit

	if err := r.db.
		WithContext(ctx).
		Model(&models.TeamMember{}).
		Count(&total).
		Error; err != nil {
		return nil, 0, err
	}

	err := r.db.
		WithContext(ctx).
		Order("sort_order ASC, created_at DESC").
		Offset(offset).
		Limit(limit).
		Find(&members).
		Error

	if err != nil {
		return nil, 0, err
	}

	return members, total, nil
}

func (r *TeamMemberRepository) ListActive(
	ctx context.Context,
) ([]models.TeamMember, error) {

	var members []models.TeamMember

	err := r.db.
		WithContext(ctx).
		Where("is_active = ?", true).
		Order("sort_order ASC, created_at DESC").
		Find(&members).
		Error

	return members, err
}

func (r *TeamMemberRepository) Update(
	ctx context.Context,
	member *models.TeamMember,
) error {

	return r.db.
		WithContext(ctx).
		Save(member).
		Error
}

func (r *TeamMemberRepository) Delete(
	ctx context.Context,
	id uuid.UUID,
) error {

	return r.db.
		WithContext(ctx).
		Delete(&models.TeamMember{}, "id = ?", id).
		Error
}
