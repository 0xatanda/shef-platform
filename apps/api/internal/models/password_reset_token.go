package models

import (
	"time"

	"github.com/google/uuid"
)

type PasswordResetToken struct {
	ID uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`

	UserID uuid.UUID `gorm:"type:uuid;not null;index"`

	TokenHash string `gorm:"type:text;uniqueIndex;not null"`

	ExpiresAt time.Time `gorm:"not null;index"`

	UsedAt *time.Time `gorm:"index"`

	CreatedAt time.Time

	UpdatedAt time.Time
}
