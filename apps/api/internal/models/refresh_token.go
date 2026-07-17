package models

import (
	"time"

	"github.com/google/uuid"
)

type RefreshToken struct {
	ID uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`

	UserID uuid.UUID `gorm:"type:uuid;not null;index"`

	Token string `gorm:"type:text;not null;uniqueIndex"`

	ExpiresAt time.Time `gorm:"not null"`

	Revoked bool `gorm:"default:false"`

	CreatedAt time.Time
}
