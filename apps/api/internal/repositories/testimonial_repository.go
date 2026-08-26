package repositories

import (
	"context"

	"github.com/0xatanda/shef-platform/internal/models"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type TestimonialRepository struct {
	db *gorm.DB
}

func NewTestimonialRepository(db *gorm.DB) *TestimonialRepository {
	return &TestimonialRepository{
		db: db,
	}
}

func (r *TestimonialRepository) Create(
	ctx context.Context,
	testimonial *models.Testimonial,
) error {

	return r.db.
		WithContext(ctx).
		Create(testimonial).
		Error
}

func (r *TestimonialRepository) FindByID(
	ctx context.Context,
	id uuid.UUID,
) (*models.Testimonial, error) {

	var testimonial models.Testimonial

	err := r.db.
		WithContext(ctx).
		First(&testimonial, "id = ?", id).
		Error

	if err != nil {
		return nil, err
	}

	return &testimonial, nil
}

func (r *TestimonialRepository) List(
	ctx context.Context,
	page int,
	limit int,
) ([]models.Testimonial, int64, error) {

	var testimonials []models.Testimonial
	var total int64

	offset := (page - 1) * limit

	if err := r.db.
		WithContext(ctx).
		Model(&models.Testimonial{}).
		Count(&total).
		Error; err != nil {
		return nil, 0, err
	}

	err := r.db.
		WithContext(ctx).
		Order("sort_order ASC, created_at DESC").
		Offset(offset).
		Limit(limit).
		Find(&testimonials).
		Error

	if err != nil {
		return nil, 0, err
	}

	return testimonials, total, nil
}

func (r *TestimonialRepository) ListActive(
	ctx context.Context,
) ([]models.Testimonial, error) {

	var testimonials []models.Testimonial

	err := r.db.
		WithContext(ctx).
		Where("is_active = ?", true).
		Order("sort_order ASC, created_at DESC").
		Find(&testimonials).
		Error

	return testimonials, err
}

func (r *TestimonialRepository) Update(
	ctx context.Context,
	testimonial *models.Testimonial,
) error {

	return r.db.
		WithContext(ctx).
		Save(testimonial).
		Error
}

func (r *TestimonialRepository) Delete(
	ctx context.Context,
	id uuid.UUID,
) error {

	return r.db.
		WithContext(ctx).
		Delete(&models.Testimonial{}, "id = ?", id).
		Error
}
