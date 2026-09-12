package services

import (
	"context"
	"errors"
	"strings"
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

// CreatePublication creates a publication together with its
// media relationships and content blocks.
func (s *PublicationService) CreatePublication(
	ctx context.Context,
	userID uuid.UUID,
	req dto.CreatePublicationRequest,
) (*dto.PublicationResponse, error) {
	title := strings.TrimSpace(req.Title)

	if title == "" {
		return nil, errors.New("publication title is required")
	}

	slug := utils.GenerateSlug(title)

	exists, err := s.publications.ExistsBySlug(
		ctx,
		slug,
	)
	if err != nil {
		return nil, err
	}

	if exists {
		slug = slug + "-" + uuid.New().String()[:8]
	}

	source := models.PublicationSource(req.PublicationSource)

	if source == "" {
		source = models.PublicationSourceSHEF
	}

	if source != models.PublicationSourceSHEF &&
		source != models.PublicationSourceExternal {
		return nil, errors.New("invalid publication source")
	}

	status := models.PublicationStatus(req.Status)

	if status == "" {
		status = models.PublicationDraft
	}

	publicationType := models.PublicationType(req.Type)

	if publicationType == "" {
		publicationType = models.PublicationArticle
	}

	if source == models.PublicationSourceExternal {
		if strings.TrimSpace(req.ExternalURL) == "" {
			return nil, errors.New("external publication URL is required")
		}

		// External publications only store the original publication link.
		req.Content = ""
		req.Summary = ""
		req.Author = ""
		req.FeaturedImage = ""
		req.PublisherName = ""
		req.ExternalURL = strings.TrimSpace(req.ExternalURL)
		req.ExternalLinkText = "Read Publication"
		req.Media = nil
		req.Blocks = nil

		// External publications are always published.
		status = models.PublicationPublished
	} else {
		if strings.TrimSpace(req.Content) == "" {
			return nil, errors.New("content is required for SHEF publications")
		}

		req.PublisherName = ""
		req.ExternalURL = ""
		req.ExternalLinkText = ""
	}

	publication := &models.Publication{
		Title:             title,
		Slug:              slug,
		Summary:           req.Summary,
		Content:           req.Content,
		Type:              publicationType,
		Status:            status,
		FeaturedImage:     req.FeaturedImage,
		PublicationSource: source,
		PublisherName:     strings.TrimSpace(req.PublisherName),
		ExternalURL:       strings.TrimSpace(req.ExternalURL),
		ExternalLinkText:  strings.TrimSpace(req.ExternalLinkText),
		Author:            req.Author,
		CreatedBy:         userID,
		UpdatedBy:         userID,
	}

	if publication.ExternalLinkText == "" &&
		source == models.PublicationSourceExternal {
		publication.ExternalLinkText = "Read Publication"
	}

	if status == models.PublicationPublished {
		now := time.Now()

		publication.PublishedAt = &now
		publication.PublishedBy = &userID
	}

	media, err := buildPublicationMedia(
		publication.ID,
		req.Media,
	)
	if err != nil {
		return nil, err
	}

	blocks, err := buildPublicationBlocks(
		publication.ID,
		req.Blocks,
	)
	if err != nil {
		return nil, err
	}

	err = s.publications.CreateWithRelations(
		ctx,
		publication,
		media,
		blocks,
	)
	if err != nil {
		return nil, err
	}

	publication, err = s.publications.FindByID(
		ctx,
		publication.ID,
	)
	if err != nil {
		return nil, err
	}

	return publicationResponse(publication), nil
}

// GetPublication returns a publication for admin use.
// This can return both drafts and published publications.
func (s *PublicationService) GetPublication(
	ctx context.Context,
	id string,
) (*dto.PublicationResponse, error) {
	publicationID, err := uuid.Parse(id)
	if err != nil {
		return nil, errors.New("invalid publication id")
	}

	publication, err := s.publications.FindByID(
		ctx,
		publicationID,
	)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("publication not found")
		}

		return nil, err
	}

	return publicationResponse(publication), nil
}

// ListPublications returns all publications for admin use.
func (s *PublicationService) ListPublications(
	ctx context.Context,
	page int,
	limit int,
) (*dto.PublicationListResponse, error) {
	page, limit = normalizePagination(page, limit)

	publications, total, err := s.publications.List(
		ctx,
		page,
		limit,
	)
	if err != nil {
		return nil, err
	}

	return publicationListResponse(
		publications,
		total,
		page,
		limit,
	), nil
}

// ListPublishedPublications returns only published publications.
func (s *PublicationService) ListPublishedPublications(
	ctx context.Context,
	page int,
	limit int,
) (*dto.PublicationListResponse, error) {
	page, limit = normalizePagination(page, limit)

	publications, total, err :=
		s.publications.ListPublished(
			ctx,
			page,
			limit,
		)

	if err != nil {
		return nil, err
	}

	return publicationListResponse(
		publications,
		total,
		page,
		limit,
	), nil
}

// GetPublishedPublication is specifically for the public website.
// It must never return drafts.
func (s *PublicationService) GetPublishedPublication(
	ctx context.Context,
	id string,
) (*dto.PublicationResponse, error) {
	publicationID, err := uuid.Parse(id)
	if err != nil {
		return nil, errors.New("invalid publication id")
	}

	publication, err :=
		s.publications.FindPublishedByID(
			ctx,
			publicationID,
		)

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("publication not found")
		}

		return nil, err
	}

	return publicationResponse(publication), nil
}

// UpdatePublication updates the publication and all of its
// media/block relationships atomically.
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

	publication, err := s.publications.FindByID(
		ctx,
		publicationID,
	)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("publication not found")
		}

		return nil, err
	}

	title := strings.TrimSpace(req.Title)

	if title == "" {
		return nil, errors.New("publication title is required")
	}

	if publication.Title != title {
		slug := utils.GenerateSlug(title)

		exists, err :=
			s.publications.ExistsBySlugExceptID(
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

		publication.Title = title
		publication.Slug = slug
	}

	source := models.PublicationSource(req.PublicationSource)

	if source == "" {
		source = publication.PublicationSource
	}

	if source == "" {
		source = models.PublicationSourceSHEF
	}

	if source != models.PublicationSourceSHEF &&
		source != models.PublicationSourceExternal {
		return nil, errors.New("invalid publication source")
	}

	publication.PublicationSource = source
	publication.UpdatedBy = userID

	if req.Type != "" {
		publication.Type = models.PublicationType(req.Type)
	}

	var mediaInput []dto.PublicationMediaInput
	var blockInput []dto.PublicationBlockInput

	if source == models.PublicationSourceExternal {
		if strings.TrimSpace(req.ExternalURL) == "" {
			return nil, errors.New("external publication URL is required")
		}

		// External publications only store the original publication link.
		publication.Summary = ""
		publication.Content = ""
		publication.FeaturedImage = ""
		publication.Author = ""
		publication.PublisherName = ""
		publication.ExternalURL = strings.TrimSpace(req.ExternalURL)
		publication.ExternalLinkText = "Read Publication"

		// External publications do not have SHEF media or content blocks.
		mediaInput = nil
		blockInput = nil

		// External publications are always published, regardless of the
		// status value sent by the client.
		publication.Status = models.PublicationPublished

		if publication.PublishedAt == nil {
			now := time.Now()
			publication.PublishedAt = &now
			publication.PublishedBy = &userID
		}
	} else {
		if strings.TrimSpace(req.Content) == "" {
			return nil, errors.New("content is required for SHEF publications")
		}

		publication.Summary = req.Summary
		publication.Content = req.Content
		publication.FeaturedImage = req.FeaturedImage
		publication.Author = req.Author
		publication.PublisherName = ""
		publication.ExternalURL = ""
		publication.ExternalLinkText = ""

		mediaInput = req.Media
		blockInput = req.Blocks

		if req.Status != "" {
			newStatus := models.PublicationStatus(req.Status)

			if newStatus != models.PublicationDraft &&
				newStatus != models.PublicationPublished {
				return nil, errors.New("invalid publication status")
			}

			if newStatus == models.PublicationPublished &&
				publication.Status != models.PublicationPublished {
				now := time.Now()
				publication.PublishedAt = &now
				publication.PublishedBy = &userID
			}

			if newStatus == models.PublicationDraft &&
				publication.Status == models.PublicationPublished {
				publication.PublishedAt = nil
				publication.PublishedBy = nil
			}

			publication.Status = newStatus
		}
	}

	media, err := buildPublicationMedia(
		publication.ID,
		mediaInput,
	)
	if err != nil {
		return nil, err
	}

	blocks, err := buildPublicationBlocks(
		publication.ID,
		blockInput,
	)
	if err != nil {
		return nil, err
	}

	err = s.publications.UpdateWithRelations(
		ctx,
		publication,
		media,
		blocks,
	)
	if err != nil {
		return nil, err
	}

	publication, err = s.publications.FindByID(
		ctx,
		publication.ID,
	)
	if err != nil {
		return nil, err
	}

	return publicationResponse(publication), nil
}

// DeletePublication soft deletes a publication.
func (s *PublicationService) DeletePublication(
	ctx context.Context,
	id string,
) error {
	publicationID, err := uuid.Parse(id)
	if err != nil {
		return errors.New("invalid publication id")
	}

	_, err = s.publications.FindByID(
		ctx,
		publicationID,
	)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("publication not found")
		}

		return err
	}

	return s.publications.Delete(
		ctx,
		publicationID,
	)
}

// RestorePublication restores a soft-deleted publication.
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
			return errors.New(
				"deleted publication not found",
			)
		}

		return err
	}

	return s.publications.Restore(
		ctx,
		publicationID,
	)
}

// PermanentDeletePublication permanently deletes a publication.
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
			return errors.New(
				"deleted publication not found",
			)
		}

		return err
	}

	return s.publications.PermanentDelete(
		ctx,
		publicationID,
	)
}

// ListDeletedPublications returns soft-deleted publications.
func (s *PublicationService) ListDeletedPublications(
	ctx context.Context,
	page int,
	limit int,
) (*dto.PublicationListResponse, error) {
	page, limit = normalizePagination(page, limit)

	publications, total, err :=
		s.publications.ListDeleted(
			ctx,
			page,
			limit,
		)

	if err != nil {
		return nil, err
	}

	return publicationListResponse(
		publications,
		total,
		page,
		limit,
	), nil
}

// buildPublicationMedia converts DTO media inputs into
// database publication_media records.
func buildPublicationMedia(
	publicationID uuid.UUID,
	inputs []dto.PublicationMediaInput,
) ([]models.PublicationMedia, error) {
	media := make(
		[]models.PublicationMedia,
		0,
		len(inputs),
	)

	for _, input := range inputs {
		mediaID, err := uuid.Parse(
			input.MediaID,
		)
		if err != nil {
			return nil, errors.New(
				"invalid publication media id",
			)
		}

		media = append(
			media,
			models.PublicationMedia{
				ID:            uuid.New(),
				PublicationID: publicationID,
				MediaID:       mediaID,
				SortOrder:     input.SortOrder,
			},
		)
	}

	return media, nil
}

// buildPublicationBlocks converts DTO block inputs into
// database publication_blocks records.
func buildPublicationBlocks(
	publicationID uuid.UUID,
	inputs []dto.PublicationBlockInput,
) ([]models.PublicationBlock, error) {
	blocks := make(
		[]models.PublicationBlock,
		0,
		len(inputs),
	)

	for _, input := range inputs {
		blockType :=
			models.PublicationBlockType(input.Type)

		if blockType != models.PublicationBlockText &&
			blockType != models.PublicationBlockImage {

			return nil, errors.New(
				"invalid publication block type",
			)
		}

		var mediaID *uuid.UUID

		if input.MediaID != nil &&
			*input.MediaID != "" {

			parsedMediaID, err := uuid.Parse(
				*input.MediaID,
			)
			if err != nil {
				return nil, errors.New(
					"invalid publication block media id",
				)
			}

			mediaID = &parsedMediaID
		}

		if blockType == models.PublicationBlockImage &&
			mediaID == nil {

			return nil, errors.New(
				"image block requires media_id",
			)
		}

		blocks = append(
			blocks,
			models.PublicationBlock{
				ID:            uuid.New(),
				PublicationID: publicationID,
				Type:          blockType,
				Content:       input.Content,
				MediaID:       mediaID,
				SortOrder:     input.SortOrder,
			},
		)
	}

	return blocks, nil
}

func normalizePagination(
	page int,
	limit int,
) (int, int) {
	if page < 1 {
		page = 1
	}

	if limit < 1 || limit > 100 {
		limit = 10
	}

	return page, limit
}

func publicationListResponse(
	publications []models.Publication,
	total int64,
	page int,
	limit int,
) *dto.PublicationListResponse {
	items := make(
		[]dto.PublicationResponse,
		0,
		len(publications),
	)

	for index := range publications {
		items = append(
			items,
			*publicationResponse(
				&publications[index],
			),
		)
	}

	totalPages := int(
		(total + int64(limit) - 1) /
			int64(limit),
	)

	return &dto.PublicationListResponse{
		Items: items,
		Pagination: dto.PaginationResponse{
			Page:       page,
			Limit:      limit,
			Total:      total,
			TotalPages: totalPages,
		},
	}
}

func publicationResponse(
	publication *models.Publication,
) *dto.PublicationResponse {
	var publishedBy *string

	if publication.PublishedBy != nil {
		value := publication.PublishedBy.String()
		publishedBy = &value
	}

	media := make(
		[]dto.PublicationMediaResponse,
		0,
		len(publication.Media),
	)

	for _, publicationMedia := range publication.Media {
		mediaItem := dto.PublicationMediaResponse{
			ID:        publicationMedia.ID.String(),
			MediaID:   publicationMedia.MediaID.String(),
			SortOrder: publicationMedia.SortOrder,
			Media:     nil,
		}

		if publicationMedia.Media.ID != uuid.Nil {
			contentMedia :=
				contentMediaResponse(
					&publicationMedia.Media,
				)

			mediaItem.Media = &contentMedia
		}

		media = append(
			media,
			mediaItem,
		)
	}

	blocks := make(
		[]dto.PublicationBlockResponse,
		0,
		len(publication.Blocks),
	)

	for _, block := range publication.Blocks {
		blockItem := dto.PublicationBlockResponse{
			ID:        block.ID.String(),
			Type:      string(block.Type),
			Content:   block.Content,
			SortOrder: block.SortOrder,
		}

		if block.MediaID != nil {
			mediaID := block.MediaID.String()
			blockItem.MediaID = &mediaID
		}

		if block.Media != nil &&
			block.Media.ID != uuid.Nil {

			contentMedia :=
				contentMediaResponse(block.Media)

			blockItem.Media = &contentMedia
		}

		blocks = append(
			blocks,
			blockItem,
		)
	}

	return &dto.PublicationResponse{
		ID:                publication.ID.String(),
		Title:             publication.Title,
		Slug:              publication.Slug,
		Summary:           publication.Summary,
		Content:           publication.Content,
		Type:              string(publication.Type),
		Status:            string(publication.Status),
		FeaturedImage:     publication.FeaturedImage,
		PublicationSource: string(publication.PublicationSource),
		PublisherName:     publication.PublisherName,
		ExternalURL:       publication.ExternalURL,
		ExternalLinkText:  publication.ExternalLinkText,
		Author:            publication.Author,
		Media:             media,
		Blocks:            blocks,
		PublishedAt:       publication.PublishedAt,
		PublishedBy:       publishedBy,
		CreatedBy:         publication.CreatedBy.String(),
		UpdatedBy:         publication.UpdatedBy.String(),
		CreatedAt:         publication.CreatedAt,
		UpdatedAt:         publication.UpdatedAt,
	}
}

func contentMediaResponse(
	media *models.ContentMedia,
) dto.ContentMediaResponse {
	return dto.ContentMediaResponse{
		ID:             media.ID.String(),
		Type:           string(media.Type),
		Title:          media.Title,
		Description:    media.Description,
		URL:            media.URL,
		ThumbnailURL:   media.ThumbnailURL,
		YouTubeVideoID: media.YouTubeVideoID,
		AltText:        media.AltText,
		CreatedAt:      media.CreatedAt,
		UpdatedAt:      media.UpdatedAt,
	}
}
