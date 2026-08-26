package dto

import "time"

type CreateContactRequest struct {
	Name    string `json:"name" validate:"required,max=255"`
	Email   string `json:"email" validate:"required,email,max=255"`
	Phone   string `json:"phone" validate:"omitempty,max=50"`
	Subject string `json:"subject" validate:"omitempty,max=255"`
	Message string `json:"message" validate:"required"`
}

type ContactResponse struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	Email     string    `json:"email"`
	Phone     string    `json:"phone"`
	Subject   string    `json:"subject"`
	Message   string    `json:"message"`
	Status    string    `json:"status"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type ContactListResponse struct {
	Items      []ContactResponse  `json:"items"`
	Pagination PaginationResponse `json:"pagination"`
}
