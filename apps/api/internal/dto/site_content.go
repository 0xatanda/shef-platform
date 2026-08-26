package dto

import "time"

type CreateSiteContentRequest struct {
	Key     string `json:"key" validate:"required,max=100"`
	Title   string `json:"title" validate:"omitempty,max=255"`
	Content string `json:"content"`
}

type UpdateSiteContentRequest struct {
	Title   string `json:"title" validate:"omitempty,max=255"`
	Content string `json:"content"`
}

type SiteContentResponse struct {
	ID        string    `json:"id"`
	Key       string    `json:"key"`
	Title     string    `json:"title"`
	Content   string    `json:"content"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type SiteContentListResponse struct {
	Items      []SiteContentResponse `json:"items"`
	Pagination PaginationResponse    `json:"pagination"`
}
