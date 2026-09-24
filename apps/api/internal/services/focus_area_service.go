package services

import (
	"context"
	"errors"
	"strings"

	"github.com/0xatanda/shef-platform/internal/dto"
	"github.com/0xatanda/shef-platform/internal/models"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

var (
	ErrFocusAreaNotFound = errors.New("focus area not found")
	ErrFocusAreaTitle    = errors.New("focus area title is required")
	ErrFocusAreaSlug     = errors.New("focus area slug is required")
)

type FocusAreaService struct {
	repo FocusAreaRepository
}

func NewFocusAreaService(
	repo FocusAreaRepository,
) *FocusAreaService {
	return &FocusAreaService{
		repo: repo,
	}
}

func (s *FocusAreaService) List(
	ctx context.Context,
	includeInactive bool,
) ([]dto.FocusAreaResponse, error) {
	items, err := s.repo.List(
		ctx,
		includeInactive,
	)

	if err != nil {
		return nil, err
	}

	result := make(
		[]dto.FocusAreaResponse,
		0,
		len(items),
	)

	for _, item := range items {
		result = append(
			result,
			toFocusAreaResponse(&item),
		)
	}

	return result, nil
}

func (s *FocusAreaService) GetByID(
	ctx context.Context,
	id uuid.UUID,
) (*dto.FocusAreaResponse, error) {
	item, err := s.repo.FindByID(ctx, id)

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrFocusAreaNotFound
		}

		return nil, err
	}

	response := toFocusAreaResponse(item)

	return &response, nil
}

func (s *FocusAreaService) GetBySlug(
	ctx context.Context,
	slug string,
) (*dto.FocusAreaResponse, error) {
	slug = strings.TrimSpace(
		strings.ToLower(slug),
	)

	item, err := s.repo.FindBySlug(
		ctx,
		slug,
	)

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrFocusAreaNotFound
		}

		return nil, err
	}

	if !item.IsActive {
		return nil, ErrFocusAreaNotFound
	}

	response := toFocusAreaResponse(item)

	return &response, nil
}

func (s *FocusAreaService) Create(
	ctx context.Context,
	req dto.CreateFocusAreaRequest,
) (*dto.FocusAreaResponse, error) {
	title := strings.TrimSpace(req.Title)
	slug := strings.TrimSpace(
		strings.ToLower(req.Slug),
	)

	if title == "" {
		return nil, ErrFocusAreaTitle
	}

	if slug == "" {
		return nil, ErrFocusAreaSlug
	}

	active := true

	if req.IsActive != nil {
		active = *req.IsActive
	}

	item := &models.FocusArea{
		Title:       title,
		Slug:        slug,
		Description: strings.TrimSpace(req.Description),
		ImageURL:    strings.TrimSpace(req.ImageURL),
		SortOrder:   req.SortOrder,
		IsActive:    active,
	}

	if err := s.repo.Create(ctx, item); err != nil {
		return nil, err
	}

	response := toFocusAreaResponse(item)

	return &response, nil
}

func (s *FocusAreaService) Update(
	ctx context.Context,
	id uuid.UUID,
	req dto.UpdateFocusAreaRequest,
) (*dto.FocusAreaResponse, error) {
	item, err := s.repo.FindByID(ctx, id)

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrFocusAreaNotFound
		}

		return nil, err
	}

	title := strings.TrimSpace(req.Title)
	slug := strings.TrimSpace(
		strings.ToLower(req.Slug),
	)

	if title == "" {
		return nil, ErrFocusAreaTitle
	}

	if slug == "" {
		return nil, ErrFocusAreaSlug
	}

	item.Title = title
	item.Slug = slug
	item.Description = strings.TrimSpace(
		req.Description,
	)
	item.ImageURL = strings.TrimSpace(
		req.ImageURL,
	)
	item.SortOrder = req.SortOrder

	if req.IsActive != nil {
		item.IsActive = *req.IsActive
	}

	if err := s.repo.Update(ctx, item); err != nil {
		return nil, err
	}

	response := toFocusAreaResponse(item)

	return &response, nil
}

func (s *FocusAreaService) Delete(
	ctx context.Context,
	id uuid.UUID,
) error {
	err := s.repo.Delete(ctx, id)

	if err != nil {
		return err
	}

	return nil
}

func toFocusAreaResponse(
	item *models.FocusArea,
) dto.FocusAreaResponse {
	return dto.FocusAreaResponse{
		ID:          item.ID,
		Title:       item.Title,
		Slug:        item.Slug,
		Description: item.Description,
		ImageURL:    item.ImageURL,
		SortOrder:   item.SortOrder,
		IsActive:    item.IsActive,
		CreatedAt: item.CreatedAt.Format(
			"2006-01-02T15:04:05Z07:00",
		),
		UpdatedAt: item.UpdatedAt.Format(
			"2006-01-02T15:04:05Z07:00",
		),
	}
}
