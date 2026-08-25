package dto

import "time"

type CreatePartnerRequest struct {
	Name         string `json:"name" validate:"required,max=255"`
	Logo         string `json:"logo" validate:"required"`
	Website      string `json:"website"`
	Description  string `json:"description"`
	DisplayOrder int    `json:"display_order"`
	IsActive     *bool  `json:"is_active"`
}

type UpdatePartnerRequest struct {
	Name         string `json:"name" validate:"required,max=255"`
	Logo         string `json:"logo" validate:"required"`
	Website      string `json:"website"`
	Description  string `json:"description"`
	DisplayOrder int    `json:"display_order"`
	IsActive     *bool  `json:"is_active"`
}

type PartnerResponse struct {
	ID           string    `json:"id"`
	Name         string    `json:"name"`
	Logo         string    `json:"logo"`
	Website      string    `json:"website"`
	Description  string    `json:"description"`
	DisplayOrder int       `json:"display_order"`
	IsActive     bool      `json:"is_active"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

type PartnerListResponse struct {
	Items      []PartnerResponse  `json:"items"`
	Pagination PaginationResponse `json:"pagination"`
}
