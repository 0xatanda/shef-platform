package models

import (
	"time"

	"github.com/google/uuid"
)

type User struct {
	ID uuid.UUID `gorm:"type:uuid;default:uuid_generate_v4();primaryKey"`

	FirstName string

	LastName string

	Email string

	PasswordHash string

	Avatar string

	Role string

	IsActive bool

	EmailVerified bool

	LastLogin *time.Time

	CreatedAt time.Time

	UpdatedAt time.Time

	DeletedAt *time.Time
}
