package dto

import "time"

type CreateDonationRequest struct {
	Name     string  `json:"name" validate:"required,max=255"`
	Email    string  `json:"email" validate:"required,email,max=255"`
	Phone    string  `json:"phone" validate:"omitempty,max=50"`
	Amount   float64 `json:"amount" validate:"required,gte=0"`
	Currency string  `json:"currency" validate:"omitempty,max=10"`
	Message  string  `json:"message"`
}

type UpdateDonationRequest struct {
	Status    string `json:"status" validate:"required"`
	AdminNote string `json:"admin_note"`
}

type DonationResponse struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	Email     string    `json:"email"`
	Phone     string    `json:"phone"`
	Amount    float64   `json:"amount"`
	Currency  string    `json:"currency"`
	Message   string    `json:"message"`
	Status    string    `json:"status"`
	AdminNote string    `json:"admin_note"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type DonationListResponse struct {
	Items      []DonationResponse `json:"items"`
	Pagination PaginationResponse `json:"pagination"`
}
