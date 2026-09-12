package dto

import "time"

type PublicationMediaInput struct {
	MediaID   string `json:"media_id" validate:"required"`
	SortOrder int    `json:"sort_order"`
}

type PublicationBlockInput struct {
	Type      string  `json:"type" validate:"required,oneof=text image"`
	Content   string  `json:"content"`
	MediaID   *string `json:"media_id,omitempty"`
	SortOrder int     `json:"sort_order"`
}

type PublicationMediaResponse struct {
	ID        string                `json:"id"`
	MediaID   string                `json:"media_id"`
	SortOrder int                   `json:"sort_order"`
	Media     *ContentMediaResponse `json:"media,omitempty"`
}

type PublicationBlockResponse struct {
	ID        string                `json:"id"`
	Type      string                `json:"type"`
	Content   string                `json:"content"`
	MediaID   *string               `json:"media_id,omitempty"`
	SortOrder int                   `json:"sort_order"`
	Media     *ContentMediaResponse `json:"media,omitempty"`
}

type CreatePublicationRequest struct {
	Title         string `json:"title" validate:"required,max=255"`
	Summary       string `json:"summary"`
	Content       string `json:"content"`
	Type          string `json:"type" validate:"omitempty,oneof=report research article policy_brief case_study other"`
	Status        string `json:"status" validate:"omitempty,oneof=draft published"`
	FeaturedImage string `json:"featured_image"`
	Author        string `json:"author" validate:"max=255"`

	PublicationSource string `json:"publication_source" validate:"omitempty,oneof=shef external"`
	PublisherName     string `json:"publisher_name" validate:"max=255"`
	ExternalURL       string `json:"external_url"`
	ExternalLinkText  string `json:"external_link_text" validate:"max=255"`

	Media  []PublicationMediaInput `json:"media,omitempty"`
	Blocks []PublicationBlockInput `json:"blocks,omitempty"`
}

type UpdatePublicationRequest struct {
	Title         string `json:"title" validate:"required,max=255"`
	Summary       string `json:"summary"`
	Content       string `json:"content"`
	Type          string `json:"type" validate:"omitempty,oneof=report research article policy_brief case_study other"`
	Status        string `json:"status" validate:"omitempty,oneof=draft published"`
	FeaturedImage string `json:"featured_image"`
	Author        string `json:"author" validate:"max=255"`

	PublicationSource string `json:"publication_source" validate:"omitempty,oneof=shef external"`
	PublisherName     string `json:"publisher_name" validate:"max=255"`
	ExternalURL       string `json:"external_url"`
	ExternalLinkText  string `json:"external_link_text" validate:"max=255"`

	Media  []PublicationMediaInput `json:"media,omitempty"`
	Blocks []PublicationBlockInput `json:"blocks,omitempty"`
}

type PublicationResponse struct {
	ID            string `json:"id"`
	Title         string `json:"title"`
	Slug          string `json:"slug"`
	Summary       string `json:"summary"`
	Content       string `json:"content"`
	Type          string `json:"type"`
	Status        string `json:"status"`
	FeaturedImage string `json:"featured_image"`
	Author        string `json:"author"`

	PublicationSource string `json:"publication_source"`
	PublisherName     string `json:"publisher_name"`
	ExternalURL       string `json:"external_url"`
	ExternalLinkText  string `json:"external_link_text"`

	Media  []PublicationMediaResponse `json:"media"`
	Blocks []PublicationBlockResponse `json:"blocks"`

	PublishedAt *time.Time `json:"published_at"`
	PublishedBy *string    `json:"published_by,omitempty"`
	CreatedBy   string     `json:"created_by"`
	UpdatedBy   string     `json:"updated_by"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
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
