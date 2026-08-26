package dto

import "time"

type CreateTeamMemberRequest struct {
	Name      string `json:"name" validate:"required,max=255"`
	Role      string `json:"role" validate:"required,max=255"`
	Bio       string `json:"bio"`
	ImageURL  string `json:"image_url"`
	Email     string `json:"email" validate:"omitempty,email,max=255"`
	LinkedIn  string `json:"linkedin"`
	Twitter   string `json:"twitter"`
	SortOrder int    `json:"sort_order"`
	IsActive  bool   `json:"is_active"`
}

type UpdateTeamMemberRequest struct {
	Name      string `json:"name" validate:"required,max=255"`
	Role      string `json:"role" validate:"required,max=255"`
	Bio       string `json:"bio"`
	ImageURL  string `json:"image_url"`
	Email     string `json:"email" validate:"omitempty,email,max=255"`
	LinkedIn  string `json:"linkedin"`
	Twitter   string `json:"twitter"`
	SortOrder int    `json:"sort_order"`
	IsActive  bool   `json:"is_active"`
}

type TeamMemberResponse struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	Role      string    `json:"role"`
	Bio       string    `json:"bio"`
	ImageURL  string    `json:"image_url"`
	Email     string    `json:"email"`
	LinkedIn  string    `json:"linkedin"`
	Twitter   string    `json:"twitter"`
	SortOrder int       `json:"sort_order"`
	IsActive  bool      `json:"is_active"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type TeamMemberListResponse struct {
	Items      []TeamMemberResponse `json:"items"`
	Pagination PaginationResponse   `json:"pagination"`
}
