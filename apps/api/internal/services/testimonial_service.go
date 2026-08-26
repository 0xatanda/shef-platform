package services

import (
	"context"
	"errors"
	"math"

	"github.com/0xatanda/shef-platform/internal/dto"
	"github.com/0xatanda/shef-platform/internal/models"
	"github.com/0xatanda/shef-platform/internal/repositories"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type TestimonialService struct {
	testimonials *repositories.TestimonialRepository
}

func NewTestimonialService(
	repo *repositories.TestimonialRepository,
) *TestimonialService {

	return &TestimonialService{
		testimonials: repo,
	}
}

func (s *TestimonialService) Create(
	ctx context.Context,
	req dto.CreateTestimonialRequest,
) (*dto.TestimonialResponse, error) {

	testimonial := &models.Testimonial{
		Name:         req.Name,
		Role:         req.Role,
		Organization: req.Organization,
		Content:      req.Content,
		ImageURL:     req.ImageURL,
		SortOrder:    req.SortOrder,
		IsActive:     req.IsActive,
	}

	if err := s.testimonials.Create(ctx, testimonial); err != nil {
		return nil, err
	}

	return s.toResponse(testimonial), nil
}

func (s *TestimonialService) Get(
	ctx context.Context,
	id string,
) (*dto.TestimonialResponse, error) {

	testimonialID, err := uuid.Parse(id)

	if err != nil {
		return nil, errors.New("invalid testimonial id")
	}

	testimonial, err := s.testimonials.FindByID(
		ctx,
		testimonialID,
	)

	if err != nil {

		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("testimonial not found")
		}

		return nil, err
	}

	return s.toResponse(testimonial), nil
}

func (s *TestimonialService) List(
	ctx context.Context,
	page int,
	limit int,
) (*dto.TestimonialListResponse, error) {

	if page < 1 {
		page = 1
	}

	if limit < 1 {
		limit = 10
	}

	if limit > 100 {
		limit = 100
	}

	testimonials, total, err := s.testimonials.List(
		ctx,
		page,
		limit,
	)

	if err != nil {
		return nil, err
	}

	items := make(
		[]dto.TestimonialResponse,
		0,
		len(testimonials),
	)

	for _, testimonial := range testimonials {

		items = append(
			items,
			*s.toResponse(&testimonial),
		)
	}

	totalPages := int(
		math.Ceil(
			float64(total) / float64(limit),
		),
	)

	return &dto.TestimonialListResponse{
		Items: items,

		Pagination: dto.PaginationResponse{
			Page:       page,
			Limit:      limit,
			Total:      total,
			TotalPages: totalPages,
		},
	}, nil
}

func (s *TestimonialService) ListActive(
	ctx context.Context,
) ([]dto.TestimonialResponse, error) {

	testimonials, err := s.testimonials.ListActive(ctx)

	if err != nil {
		return nil, err
	}

	result := make(
		[]dto.TestimonialResponse,
		0,
		len(testimonials),
	)

	for _, testimonial := range testimonials {

		result = append(
			result,
			*s.toResponse(&testimonial),
		)
	}

	return result, nil
}

func (s *TestimonialService) Update(
	ctx context.Context,
	id string,
	req dto.UpdateTestimonialRequest,
) (*dto.TestimonialResponse, error) {

	testimonialID, err := uuid.Parse(id)

	if err != nil {
		return nil, errors.New("invalid testimonial id")
	}

	testimonial, err := s.testimonials.FindByID(
		ctx,
		testimonialID,
	)

	if err != nil {

		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("testimonial not found")
		}

		return nil, err
	}

	testimonial.Name = req.Name
	testimonial.Role = req.Role
	testimonial.Organization = req.Organization
	testimonial.Content = req.Content
	testimonial.ImageURL = req.ImageURL
	testimonial.SortOrder = req.SortOrder
	testimonial.IsActive = req.IsActive

	if err := s.testimonials.Update(
		ctx,
		testimonial,
	); err != nil {
		return nil, err
	}

	return s.toResponse(testimonial), nil
}

func (s *TestimonialService) Delete(
	ctx context.Context,
	id string,
) error {

	testimonialID, err := uuid.Parse(id)

	if err != nil {
		return errors.New("invalid testimonial id")
	}

	_, err = s.testimonials.FindByID(
		ctx,
		testimonialID,
	)

	if err != nil {

		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("testimonial not found")
		}

		return err
	}

	return s.testimonials.Delete(
		ctx,
		testimonialID,
	)
}

func (s *TestimonialService) toResponse(
	testimonial *models.Testimonial,
) *dto.TestimonialResponse {

	return &dto.TestimonialResponse{
		ID:           testimonial.ID.String(),
		Name:         testimonial.Name,
		Role:         testimonial.Role,
		Organization: testimonial.Organization,
		Content:      testimonial.Content,
		ImageURL:     testimonial.ImageURL,
		SortOrder:    testimonial.SortOrder,
		IsActive:     testimonial.IsActive,
		CreatedAt:    testimonial.CreatedAt,
		UpdatedAt:    testimonial.UpdatedAt,
	}
}
