package services

import (
	"context"
	"errors"
	"io"
	"math"
	"mime/multipart"
	"os"
	"path/filepath"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/0xatanda/shef-platform/internal/dto"
	"github.com/0xatanda/shef-platform/internal/models"
)

type MediaService struct {
	media MediaRepository
}

func NewMediaService(media MediaRepository) *MediaService {
	return &MediaService{
		media: media,
	}
}

func (s *MediaService) UploadMedia(
	ctx context.Context,
	userID uuid.UUID,
	file *multipart.FileHeader,
) (*dto.MediaResponse, error) {

	if file == nil {
		return nil, errors.New("file is required")
	}

	const maxSize int64 = 10 << 20 // 10 MB

	if file.Size > maxSize {
		return nil, errors.New("file exceeds 10MB")
	}

	uploadDir := "./storage/uploads"

	if err := os.MkdirAll(uploadDir, os.ModePerm); err != nil {
		return nil, err
	}

	filename := uuid.New().String() + filepath.Ext(file.Filename)

	dstPath := filepath.Join(uploadDir, filename)

	src, err := file.Open()
	if err != nil {
		return nil, err
	}
	defer src.Close()

	dst, err := os.Create(dstPath)
	if err != nil {
		return nil, err
	}
	defer dst.Close()

	if _, err := io.Copy(dst, src); err != nil {
		return nil, err
	}

	media := &models.Media{
		OriginalName: file.Filename,
		Filename:     filename,
		MimeType:     file.Header.Get("Content-Type"),
		Size:         file.Size,
		Path:         dstPath,
		URL:          "/uploads/" + filename,
		UploadedBy:   userID,
	}

	if err := s.media.Create(ctx, media); err != nil {
		// Remove the physical file if database creation fails.
		_ = os.Remove(dstPath)
		return nil, err
	}

	return &dto.MediaResponse{
		ID:           media.ID.String(),
		OriginalName: media.OriginalName,
		Filename:     media.Filename,
		MimeType:     media.MimeType,
		Size:         media.Size,
		Path:         media.Path,
		URL:          media.URL,
		CreatedAt:    media.CreatedAt,
	}, nil
}

func (s *MediaService) GetMedia(
	ctx context.Context,
	id string,
) (*dto.MediaResponse, error) {

	mediaID, err := uuid.Parse(id)
	if err != nil {
		return nil, errors.New("invalid media id")
	}

	media, err := s.media.FindByID(ctx, mediaID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("media not found")
		}
		return nil, err
	}

	return &dto.MediaResponse{
		ID:           media.ID.String(),
		OriginalName: media.OriginalName,
		Filename:     media.Filename,
		MimeType:     media.MimeType,
		Size:         media.Size,
		Path:         media.Path,
		URL:          media.URL,
		CreatedAt:    media.CreatedAt,
	}, nil
}

func (s *MediaService) ListMedia(
	ctx context.Context,
	page,
	limit int,
) (*dto.MediaListResponse, error) {

	items, total, err := s.media.List(ctx, page, limit)
	if err != nil {
		return nil, err
	}

	responseItems := make([]dto.MediaListItem, 0)

	for _, m := range items {
		responseItems = append(responseItems, dto.MediaListItem{
			ID:           m.ID.String(),
			OriginalName: m.OriginalName,
			Filename:     m.Filename,
			MimeType:     m.MimeType,
			Size:         m.Size,
			URL:          m.URL,
			CreatedAt:    m.CreatedAt,
		})
	}

	totalPages := int(math.Ceil(float64(total) / float64(limit)))

	return &dto.MediaListResponse{
		Items: responseItems,
		Pagination: dto.Pagination{
			Page:       page,
			Limit:      limit,
			Total:      total,
			TotalPages: totalPages,
		},
	}, nil
}

func (s *MediaService) DeleteMedia(
	ctx context.Context,
	id string,
) error {

	mediaID, err := uuid.Parse(id)
	if err != nil {
		return errors.New("invalid media id")
	}

	return s.media.Delete(ctx, mediaID)
}
