package dto

import "time"

type CreateProjectRequest struct {
	Title         string `json:"title" validate:"required,max=255"`
	Summary       string `json:"summary"`
	Content       string `json:"content" validate:"required"`
	FeaturedImage string `json:"featured_image"`
	Status        string `json:"status" validate:"omitempty,oneof=draft published"`
}

type UpdateProjectRequest struct {
	Title         string `json:"title" validate:"required,max=255"`
	Summary       string `json:"summary"`
	Content       string `json:"content" validate:"required"`
	FeaturedImage string `json:"featured_image"`
	Status        string `json:"status" validate:"omitempty,oneof=draft published"`
}

type ProjectResponse struct {
	ID            string                 `json:"id"`
	Title         string                 `json:"title"`
	Slug          string                 `json:"slug"`
	Summary       string                 `json:"summary"`
	Content       string                 `json:"content"`
	FeaturedImage string                 `json:"featured_image"`
	Status        string                 `json:"status"`
	Media         []ProjectMediaResponse `json:"media"`
	PublishedAt   *time.Time             `json:"published_at,omitempty"`
	CreatedAt     time.Time              `json:"created_at"`
	UpdatedAt     time.Time              `json:"updated_at"`
}

type ProjectListItem struct {
	ID            string     `json:"id"`
	Title         string     `json:"title"`
	Slug          string     `json:"slug"`
	Summary       string     `json:"summary"`
	FeaturedImage string     `json:"featured_image"`
	Status        string     `json:"status"`
	PublishedAt   *time.Time `json:"published_at,omitempty"`
}

type ProjectListResponse struct {
	Items      []ProjectListItem `json:"items"`
	Pagination Pagination        `json:"pagination"`
}

type AddProjectMediaRequest struct {
	MediaID string `json:"media_id" validate:"required"`
	AltText string `json:"alt_text"`
}

type ProjectMediaOrderItem struct {
	ID        string `json:"id" validate:"required"`
	SortOrder int    `json:"sort_order"`
}

type UpdateProjectMediaOrderRequest struct {
	Items []ProjectMediaOrderItem `json:"items" validate:"required,min=1"`
}

type ProjectMediaResponse struct {
	ID         string `json:"id"`
	MediaID    string `json:"media_id"`
	URL        string `json:"url"`
	AltText    string `json:"alt_text"`
	SortOrder  int    `json:"sort_order"`
	IsFeatured bool   `json:"is_featured"`
}
