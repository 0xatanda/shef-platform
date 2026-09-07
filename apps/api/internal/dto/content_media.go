package dto

import "time"

type CreateContentMediaRequest struct {
	Type           string `json:"type" validate:"required,oneof=image youtube"`
	Title          string `json:"title" validate:"omitempty,max=255"`
	Description    string `json:"description"`
	URL            string `json:"url" validate:"required,url"`
	ThumbnailURL   string `json:"thumbnail_url" validate:"omitempty,url"`
	YouTubeVideoID string `json:"youtube_video_id" validate:"omitempty,max=100"`
	AltText        string `json:"alt_text"`
}

type UpdateContentMediaRequest struct {
	Title          string `json:"title" validate:"omitempty,max=255"`
	Description    string `json:"description"`
	URL            string `json:"url" validate:"omitempty,url"`
	ThumbnailURL   string `json:"thumbnail_url" validate:"omitempty,url"`
	YouTubeVideoID string `json:"youtube_video_id" validate:"omitempty,max=100"`
	AltText        string `json:"alt_text"`
}

type ContentMediaResponse struct {
	ID             string    `json:"id"`
	Type           string    `json:"type"`
	Title          string    `json:"title"`
	Description    string    `json:"description"`
	URL            string    `json:"url"`
	ThumbnailURL   string    `json:"thumbnail_url"`
	YouTubeVideoID string    `json:"youtube_video_id"`
	AltText        string    `json:"alt_text"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

type ContentMediaListResponse struct {
	Items      []ContentMediaResponse `json:"items"`
	Pagination Pagination             `json:"pagination"`
}
