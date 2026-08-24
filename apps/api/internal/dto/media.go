package dto

import "time"

type MediaResponse struct {
	ID           string    `json:"id"`
	OriginalName string    `json:"original_name"`
	Filename     string    `json:"filename"`
	MimeType     string    `json:"mime_type"`
	Size         int64     `json:"size"`
	Path         string    `json:"path"`
	URL          string    `json:"url"`
	CreatedAt    time.Time `json:"created_at"`
}

type MediaListItem struct {
	ID           string    `json:"id"`
	OriginalName string    `json:"original_name"`
	Filename     string    `json:"filename"`
	MimeType     string    `json:"mime_type"`
	Size         int64     `json:"size"`
	URL          string    `json:"url"`
	CreatedAt    time.Time `json:"created_at"`
}

type MediaListResponse struct {
	Items      []MediaListItem `json:"items"`
	Pagination Pagination      `json:"pagination"`
}
