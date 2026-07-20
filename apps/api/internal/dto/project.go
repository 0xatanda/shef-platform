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
	ID            string     `json:"id"`
	Title         string     `json:"title"`
	Slug          string     `json:"slug"`
	Summary       string     `json:"summary"`
	Content       string     `json:"content"`
	FeaturedImage string     `json:"featured_image"`
	Status        string     `json:"status"`
	PublishedAt   *time.Time `json:"published_at,omitempty"`
	CreatedAt     time.Time  `json:"created_at"`
	UpdatedAt     time.Time  `json:"updated_at"`
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
