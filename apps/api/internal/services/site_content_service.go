package services

import (
	"context"
	"errors"
	"math"
	"strings"

	"github.com/0xatanda/shef-platform/internal/dto"
	"github.com/0xatanda/shef-platform/internal/models"
	"github.com/0xatanda/shef-platform/internal/repositories"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type SiteContentService struct {
	contents *repositories.SiteContentRepository
}

func NewSiteContentService(
	contentRepo *repositories.SiteContentRepository,
) *SiteContentService {

	return &SiteContentService{
		contents: contentRepo,
	}
}

func (s *SiteContentService) CreateContent(
	ctx context.Context,
	req dto.CreateSiteContentRequest,
) (*dto.SiteContentResponse, error) {

	key := strings.TrimSpace(req.Key)

	if key == "" {
		return nil, errors.New("content key is required")
	}

	_, err := s.contents.FindByKey(ctx, key)

	if err == nil {
		return nil, errors.New("content key already exists")
	}

	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	content := &models.SiteContent{
		Key:     key,
		Title:   req.Title,
		Content: req.Content,
	}

	if err := s.contents.Create(ctx, content); err != nil {
		return nil, err
	}

	return s.toResponse(content), nil
}

func (s *SiteContentService) GetContent(
	ctx context.Context,
	id string,
) (*dto.SiteContentResponse, error) {

	contentID, err := uuid.Parse(id)

	if err != nil {
		return nil, errors.New("invalid content id")
	}

	content, err := s.contents.FindByID(ctx, contentID)

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("content not found")
		}

		return nil, err
	}

	return s.toResponse(content), nil
}

func (s *SiteContentService) GetContentByKey(
	ctx context.Context,
	key string,
) (*dto.SiteContentResponse, error) {

	key = strings.TrimSpace(key)

	if key == "" {
		return nil, errors.New("content key is required")
	}

	content, err := s.contents.FindByKey(ctx, key)

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("content not found")
		}

		return nil, err
	}

	return s.toResponse(content), nil
}

func (s *SiteContentService) ListContents(
	ctx context.Context,
	page int,
	limit int,
) (*dto.SiteContentListResponse, error) {

	if page < 1 {
		page = 1
	}

	if limit < 1 {
		limit = 10
	}

	if limit > 100 {
		limit = 100
	}

	contents, total, err := s.contents.List(
		ctx,
		page,
		limit,
	)

	if err != nil {
		return nil, err
	}

	items := make(
		[]dto.SiteContentResponse,
		0,
		len(contents),
	)

	for _, content := range contents {
		items = append(
			items,
			*s.toResponse(&content),
		)
	}

	totalPages := int(
		math.Ceil(
			float64(total) / float64(limit),
		),
	)

	return &dto.SiteContentListResponse{
		Items: items,
		Pagination: dto.PaginationResponse{
			Page:       page,
			Limit:      limit,
			Total:      total,
			TotalPages: totalPages,
		},
	}, nil
}

func (s *SiteContentService) UpdateContent(
	ctx context.Context,
	id string,
	req dto.UpdateSiteContentRequest,
) (*dto.SiteContentResponse, error) {

	contentID, err := uuid.Parse(id)

	if err != nil {
		return nil, errors.New("invalid content id")
	}

	content, err := s.contents.FindByID(
		ctx,
		contentID,
	)

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("content not found")
		}

		return nil, err
	}

	content.Title = req.Title
	content.Content = req.Content

	if err := s.contents.Update(ctx, content); err != nil {
		return nil, err
	}

	return s.toResponse(content), nil
}

func (s *SiteContentService) DeleteContent(
	ctx context.Context,
	id string,
) error {

	contentID, err := uuid.Parse(id)

	if err != nil {
		return errors.New("invalid content id")
	}

	_, err = s.contents.FindByID(
		ctx,
		contentID,
	)

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("content not found")
		}

		return err
	}

	return s.contents.Delete(
		ctx,
		contentID,
	)
}

func (s *SiteContentService) toResponse(
	content *models.SiteContent,
) *dto.SiteContentResponse {

	return &dto.SiteContentResponse{
		ID:        content.ID.String(),
		Key:       content.Key,
		Title:     content.Title,
		Content:   content.Content,
		CreatedAt: content.CreatedAt,
		UpdatedAt: content.UpdatedAt,
	}
}
