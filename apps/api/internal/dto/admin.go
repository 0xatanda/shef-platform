package dto

import "github.com/google/uuid"

type CreateUserRequest struct {
	FirstName string `json:"first_name" validate:"required,min=2,max=100"`
	LastName  string `json:"last_name" validate:"required,min=2,max=100"`
	Email     string `json:"email" validate:"required,email,max=255"`
	Password  string `json:"password" validate:"required,min=12,max=128"`
	Role      string `json:"role" validate:"required"`
}

type UpdateUserRequest struct {
	FirstName string `json:"first_name" validate:"required,min=2,max=100"`
	LastName  string `json:"last_name" validate:"required,min=2,max=100"`
	Role      string `json:"role" validate:"omitempty"`
}

type ChangeUserStatusRequest struct {
	IsActive bool `json:"is_active"`
}

type UserListItem struct {
	ID            uuid.UUID `json:"id"`
	FirstName     string    `json:"first_name"`
	LastName      string    `json:"last_name"`
	Email         string    `json:"email"`
	Role          string    `json:"role"`
	IsActive      bool      `json:"is_active"`
	EmailVerified bool      `json:"email_verified"`
	LastLogin     *string   `json:"last_login,omitempty"`
}

type UserListResponse struct {
	Items []UserListItem `json:"items"`
	Page  int            `json:"page"`
	Limit int            `json:"limit"`
	Total int64          `json:"total"`
}
