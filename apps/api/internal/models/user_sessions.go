package models

import (
	"time"

	"github.com/google/uuid"
)

type UserSession struct {
	ID uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`

	UserID uuid.UUID `gorm:"type:uuid;not null;index"`

	RefreshTokenHash string `gorm:"type:text;uniqueIndex;not null"`

	LastSeenAt time.Time `gorm:"not null;index"`

	ExpiresAt time.Time `gorm:"not null;index"`

	RevokedAt *time.Time `gorm:"index"`

	IPAddress string `gorm:"size:45"`

	UserAgent string `gorm:"type:text"`

	CreatedAt time.Time

	UpdatedAt time.Time
}
