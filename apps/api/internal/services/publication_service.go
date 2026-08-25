package services

import (
	"context"
	"errors"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/0xatanda/shef-platform/internal/dto"
	"github.com/0xatanda/shef-platform/internal/models"
	"github.com/0xatanda/shef-platform/pkg/utils"
)

type PublicationService struct {
	publications PublicationRepository
}

func NewPublicationService(
	publications PublicationRepository,
) *PublicationService {
	return &PublicationService{
		publications: publications,
	}
}

func (s *PublicationService) CreatePublication(
	ctx context.Context,
	userID uuid.UUID,
	req dto.CreatePublicationRequest,
) (*dto.PublicationResponse, error) {

	slug := utils.GenerateSlug(req.Title)

	exists, err := s.publications.ExistsBySlug(ctx, slug)
	if err != nil {
		return nil, err
	}

	if exists {
		slug = slug + "-" + uuid.New().String()[:8]
	}

	status := models.PublicationStatus(req.Status)

	if status == "" {
		status = models.PublicationDaft
	}

	publicationType := models.PublicationType(req.Type)

	if publicationType == "" {
		publicationType = models.PublicationArticle
	}

	publication := &models.Publication{
		Title:         req.Title,
		Slug:          slug,
		Summary:       req.Summary,
		Content:       req.Content,
		Type:          publicationType,
		Status:        status,
		FeaturedImage: req.FeaturedImage,
		Author:        req.Author,
		CreatedBy:     userID,
		UpdatedBy:     userID,
	}

	if status == models.PublicationPublished {
		now := time.Now()
		publication.PublishedAt = &now
		publication.PublishedBy = &userID
	}

	if err := s.publications.Create(ctx, publication); err != nil {
		return nil, err
	}

	return publicationResponse(publication), nil
}

func (s *PublicationService) GetPublication(
	ctx context.Context,
	id string,
) (*dto.PublicationResponse, error) {

	publicationID, err := uuid.Parse(id)
	if err != nil {
		return nil, errors.New("invalid publication id")
	}

	publication, err := s.publications.FindByID(ctx, publicationID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("publication not found")
		}

		return nil, err
	}

	return publicationResponse(publication), nil
}

func (s *PublicationService) ListPublications(
	ctx context.Context,
	page int,
	limit int,
) (*dto.PublicationListResponse, error) {

	if page < 1 {
		page = 1
	}

	if limit < 1 || limit > 100 {
		limit = 10
	}

	publications, total, err := s.publications.List(
		ctx,
		page,
		limit,
	)
	if err != nil {
		return nil, err
	}

	items := make([]dto.PublicationResponse, 0, len(publications))

	for _, publication := range publications {
		items = append(
			items,
			*publicationResponse(&publication),
		)
	}

	totalPages := int((total + int64(limit) - 1) / int64(limit))

	return &dto.PublicationListResponse{
		Items: items,
		Pagination: dto.PaginationResponse{
			Page:       page,
			Limit:      limit,
			Total:      total,
			TotalPages: totalPages,
		},
	}, nil
}

func (s *PublicationService) UpdatePublication(
	ctx context.Context,
	userID uuid.UUID,
	id string,
	req dto.UpdatePublicationRequest,
) (*dto.PublicationResponse, error) {

	publicationID, err := uuid.Parse(id)
	if err != nil {
		return nil, errors.New("invalid publication id")
	}

	publication, err := s.publications.FindByID(ctx, publicationID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("publication not found")
		}

		return nil, err
	}

	if publication.Title != req.Title {

		slug := utils.GenerateSlug(req.Title)

		exists, err := s.publications.ExistsBySlugExceptID(
			ctx,
			slug,
			publication.ID,
		)
		if err != nil {
			return nil, err
		}

		if exists {
			slug = slug + "-" + uuid.New().String()[:8]
		}

		publication.Title = req.Title
		publication.Slug = slug
	}

	publication.Summary = req.Summary
	publication.Content = req.Content
	publication.FeaturedImage = req.FeaturedImage
	publication.Author = req.Author
	publication.UpdatedBy = userID

	if req.Type != "" {
		publication.Type = models.PublicationType(req.Type)
	}

	if req.Status != "" {

		newStatus := models.PublicationStatus(req.Status)

		if newStatus == models.PublicationPublished &&
			publication.Status != models.PublicationPublished {

			now := time.Now()

			publication.PublishedAt = &now
			publication.PublishedBy = &userID
		}

		publication.Status = newStatus
	}

	if err := s.publications.Update(ctx, publication); err != nil {
		return nil, err
	}

	return publicationResponse(publication), nil
}

func (s *PublicationService) DeletePublication(
	ctx context.Context,
	id string,
) error {

	publicationID, err := uuid.Parse(id)
	if err != nil {
		return errors.New("invalid publication id")
	}

	_, err = s.publications.FindByID(ctx, publicationID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("publication not found")
		}

		return err
	}

	return s.publications.Delete(ctx, publicationID)
}

func (s *PublicationService) RestorePublication(
	ctx context.Context,
	id string,
) error {

	publicationID, err := uuid.Parse(id)
	if err != nil {
		return errors.New("invalid publication id")
	}

	_, err = s.publications.FindDeletedByID(
		ctx,
		publicationID,
	)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("deleted publication not found")
		}

		return err
	}

	return s.publications.Restore(ctx, publicationID)
}

func (s *PublicationService) PermanentDeletePublication(
	ctx context.Context,
	id string,
) error {

	publicationID, err := uuid.Parse(id)
	if err != nil {
		return errors.New("invalid publication id")
	}

	_, err = s.publications.FindDeletedByID(
		ctx,
		publicationID,
	)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("deleted publication not found")
		}

		return err
	}

	return s.publications.PermanentDelete(
		ctx,
		publicationID,
	)
}

func (s *PublicationService) ListDeletedPublications(
	ctx context.Context,
	page int,
	limit int,
) (*dto.PublicationListResponse, error) {

	if page < 1 {
		page = 1
	}

	if limit < 1 || limit > 100 {
		limit = 10
	}

	publications, total, err := s.publications.ListDeleted(
		ctx,
		page,
		limit,
	)
	if err != nil {
		return nil, err
	}

	items := make([]dto.PublicationResponse, 0, len(publications))

	for _, publication := range publications {
		items = append(
			items,
			*publicationResponse(&publication),
		)
	}

	totalPages := int((total + int64(limit) - 1) / int64(limit))

	return &dto.PublicationListResponse{
		Items: items,
		Pagination: dto.PaginationResponse{
			Page:       page,
			Limit:      limit,
			Total:      total,
			TotalPages: totalPages,
		},
	}, nil
}

func publicationResponse(
	publication *models.Publication,
) *dto.PublicationResponse {

	var publishedBy *string

	if publication.PublishedBy != nil {
		value := publication.PublishedBy.String()
		publishedBy = &value
	}

	return &dto.PublicationResponse{
		ID:            publication.ID.String(),
		Title:         publication.Title,
		Slug:          publication.Slug,
		Summary:       publication.Summary,
		Content:       publication.Content,
		Type:          string(publication.Type),
		Status:        string(publication.Status),
		FeaturedImage: publication.FeaturedImage,
		Author:        publication.Author,
		PublishedAt:   publication.PublishedAt,
		PublishedBy:   publishedBy,
		CreatedBy:     publication.CreatedBy.String(),
		UpdatedBy:     publication.UpdatedBy.String(),
		CreatedAt:     publication.CreatedAt,
		UpdatedAt:     publication.UpdatedAt,
	}
}
