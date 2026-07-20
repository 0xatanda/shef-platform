package dto

import "github.com/google/uuid"

type CreateUserRequest struct {
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	Email     string `json:"email"`
	Password  string `json:"password"`
	Role      string `json:"role"`
}

type UpdateUserRequest struct {
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	Role      string `json:"role"`
}

type ChangeStatusRequest struct {
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
}

type UserListResponse struct {
	Items []UserListItem `json:"items"`
	Page  int            `json:"page"`
	Limit int            `json:"limit"`
	Total int64          `json:"total"`
}

type ChangeUserStatusRequest struct {
	IsActive bool `json:"is_active"`
}
