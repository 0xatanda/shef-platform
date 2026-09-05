package dto

import "time"

type CreatePublicationRequest struct {
	Title         string `json:"title" validate:"required,max=255"`
	Summary       string `json:"summary"`
	Content       string `json:"content" validate:"required"`
	Type          string `json:"type" validate:"omitempty,oneof=report research article policy_brief case_study other"`
	FeaturedImage string `json:"featured_image"`
	ExternalURL   string `json:"external_url"`
	Author        string `json:"author" validate:"max=255"`
	Status        string `json:"status" validate:"omitempty,oneof=draft published"`
}

type UpdatePublicationRequest struct {
	Title         string `json:"title" validate:"required,max=255"`
	Summary       string `json:"summary"`
	Content       string `json:"content" validate:"required"`
	Type          string `json:"type" validate:"omitempty,oneof=report research article policy_brief case_study other"`
	FeaturedImage string `json:"featured_image"`
	ExternalURL   string `json:"external_url"`
	Author        string `json:"author" validate:"max=255"`
	Status        string `json:"status" validate:"omitempty,oneof=draft published"`
}

type PublicationResponse struct {
	ID            string     `json:"id"`
	Title         string     `json:"title"`
	Slug          string     `json:"slug"`
	Summary       string     `json:"summary"`
	Content       string     `json:"content"`
	Type          string     `json:"type"`
	Status        string     `json:"status"`
	FeaturedImage string     `json:"featured_image"`
	Author        string     `json:"author"`
	PublishedAt   *time.Time `json:"published_at"`
	PublishedBy   *string    `json:"published_by,omitempty"`
	CreatedBy     string     `json:"created_by"`
	UpdatedBy     string     `json:"updated_by"`
	CreatedAt     time.Time  `json:"created_at"`
	UpdatedAt     time.Time  `json:"updated_at"`
}

type PublicationListResponse struct {
	Items      []PublicationResponse `json:"items"`
	Pagination PaginationResponse    `json:"pagination"`
}

type PaginationResponse struct {
	Page       int   `json:"page"`
	Limit      int   `json:"limit"`
	Total      int64 `json:"total"`
	TotalPages int   `json:"total_pages"`
}
