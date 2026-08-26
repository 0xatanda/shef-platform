package dto

import "time"

type CreateTestimonialRequest struct {
	Name         string `json:"name" validate:"required,max=255"`
	Role         string `json:"role" validate:"omitempty,max=255"`
	Organization string `json:"organization" validate:"omitempty,max=255"`
	Content      string `json:"content" validate:"required"`
	ImageURL     string `json:"image_url"`
	SortOrder    int    `json:"sort_order"`
	IsActive     bool   `json:"is_active"`
}

type UpdateTestimonialRequest struct {
	Name         string `json:"name" validate:"required,max=255"`
	Role         string `json:"role" validate:"omitempty,max=255"`
	Organization string `json:"organization" validate:"omitempty,max=255"`
	Content      string `json:"content" validate:"required"`
	ImageURL     string `json:"image_url"`
	SortOrder    int    `json:"sort_order"`
	IsActive     bool   `json:"is_active"`
}

type TestimonialResponse struct {
	ID           string    `json:"id"`
	Name         string    `json:"name"`
	Role         string    `json:"role"`
	Organization string    `json:"organization"`
	Content      string    `json:"content"`
	ImageURL     string    `json:"image_url"`
	SortOrder    int       `json:"sort_order"`
	IsActive     bool      `json:"is_active"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

type TestimonialListResponse struct {
	Items      []TestimonialResponse `json:"items"`
	Pagination PaginationResponse    `json:"pagination"`
}
