package services

import (
	"context"
	"errors"
	"net/url"
	"strings"

	"github.com/google/uuid"

	"github.com/0xatanda/shef-platform/internal/dto"
	"github.com/0xatanda/shef-platform/internal/models"
)

type ContentMediaService struct {
	media ContentMediaRepository
}

func NewContentMediaService(
	media ContentMediaRepository,
) *ContentMediaService {
	return &ContentMediaService{
		media: media,
	}
}

func (s *ContentMediaService) Create(
	ctx context.Context,
	req dto.CreateContentMediaRequest,
	userID uuid.UUID,
) (*dto.ContentMediaResponse, error) {
	mediaType := strings.ToLower(strings.TrimSpace(req.Type))

	if mediaType != "image" && mediaType != "youtube" {
		return nil, errors.New("invalid media type")
	}

	media := &models.ContentMedia{
		Type:           models.ContentMediaType(mediaType),
		Title:          strings.TrimSpace(req.Title),
		Description:    strings.TrimSpace(req.Description),
		URL:            strings.TrimSpace(req.URL),
		ThumbnailURL:   strings.TrimSpace(req.ThumbnailURL),
		YouTubeVideoID: strings.TrimSpace(req.YouTubeVideoID),
		AltText:        strings.TrimSpace(req.AltText),
		CreatedBy:      userID,
		UpdatedBy:      userID,
	}

	if mediaType == "youtube" {
		videoID := media.YouTubeVideoID

		if videoID == "" {
			videoID = extractYouTubeVideoID(media.URL)
		}

		if videoID == "" {
			return nil, errors.New("invalid YouTube URL or video ID")
		}

		media.YouTubeVideoID = videoID

		if media.ThumbnailURL == "" {
			media.ThumbnailURL = "https://img.youtube.com/vi/" + videoID + "/hqdefault.jpg"
		}
	}

	if err := s.media.Create(ctx, media); err != nil {
		return nil, err
	}

	return mapContentMediaResponse(media), nil
}

func (s *ContentMediaService) Get(
	ctx context.Context,
	id uuid.UUID,
) (*dto.ContentMediaResponse, error) {
	media, err := s.media.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}

	return mapContentMediaResponse(media), nil
}

func (s *ContentMediaService) Update(
	ctx context.Context,
	id uuid.UUID,
	req dto.UpdateContentMediaRequest,
	userID uuid.UUID,
) (*dto.ContentMediaResponse, error) {
	media, err := s.media.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}

	if req.Title != "" {
		media.Title = strings.TrimSpace(req.Title)
	}

	media.Description = strings.TrimSpace(req.Description)
	media.AltText = strings.TrimSpace(req.AltText)

	if req.URL != "" {
		media.URL = strings.TrimSpace(req.URL)
	}

	if req.ThumbnailURL != "" {
		media.ThumbnailURL = strings.TrimSpace(req.ThumbnailURL)
	}

	if req.YouTubeVideoID != "" {
		media.YouTubeVideoID = strings.TrimSpace(req.YouTubeVideoID)
	}

	if media.Type == "youtube" {
		videoID := media.YouTubeVideoID

		if videoID == "" {
			videoID = extractYouTubeVideoID(media.URL)
		}

		if videoID == "" {
			return nil, errors.New("invalid YouTube URL or video ID")
		}

		media.YouTubeVideoID = videoID

		if media.ThumbnailURL == "" {
			media.ThumbnailURL = "https://img.youtube.com/vi/" + videoID + "/hqdefault.jpg"
		}
	}

	media.UpdatedBy = userID

	if err := s.media.Update(ctx, media); err != nil {
		return nil, err
	}

	return mapContentMediaResponse(media), nil
}

func (s *ContentMediaService) Delete(
	ctx context.Context,
	id uuid.UUID,
) error {
	return s.media.Delete(ctx, id)
}

func (s *ContentMediaService) List(
	ctx context.Context,
	page int,
	limit int,
	mediaType string,
) (*dto.ContentMediaListResponse, error) {
	if page < 1 {
		page = 1
	}

	if limit < 1 {
		limit = 20
	}

	if limit > 100 {
		limit = 100
	}

	media, total, err := s.media.List(
		ctx,
		page,
		limit,
		mediaType,
	)
	if err != nil {
		return nil, err
	}

	items := make([]dto.ContentMediaResponse, 0, len(media))

	for i := range media {
		items = append(
			items,
			*mapContentMediaResponse(&media[i]),
		)
	}

	return &dto.ContentMediaListResponse{
		Items: items,
		Pagination: dto.Pagination{
			Page:       page,
			Limit:      limit,
			Total:      total,
			TotalPages: calculateTotalPages(total, limit),
		},
	}, nil
}

func mapContentMediaResponse(
	media *models.ContentMedia,
) *dto.ContentMediaResponse {
	return &dto.ContentMediaResponse{
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

func calculateTotalPages(total int64, limit int) int {
	if total == 0 {
		return 0
	}

	return int((total + int64(limit) - 1) / int64(limit))
}

func extractYouTubeVideoID(rawURL string) string {
	parsed, err := url.Parse(strings.TrimSpace(rawURL))
	if err != nil {
		return ""
	}

	host := strings.ToLower(parsed.Hostname())

	switch host {
	case "youtu.be":
		id := strings.Trim(parsed.Path, "/")
		if id != "" {
			return id
		}

	case "youtube.com", "www.youtube.com", "m.youtube.com":
		if id := parsed.Query().Get("v"); id != "" {
			return id
		}

		path := strings.Trim(parsed.Path, "/")

		if strings.HasPrefix(path, "shorts/") {
			return strings.TrimPrefix(path, "shorts/")
		}

		if strings.HasPrefix(path, "embed/") {
			return strings.TrimPrefix(path, "embed/")
		}
	}

	return ""
}
