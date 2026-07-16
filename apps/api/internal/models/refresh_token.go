package models

import (
	"time"

	"github.com/google/uuid"
)

type RefreshToken struct {
	ID uuid.UUID `gorm:"type:uuid;default:uuid_generate_v4();primaryKey"`

	UserID uuid.UUID `gorm:"type:uuid;not null"`

	Token string `gorm:"type:text;not null"`

	ExpiresAt time.Time

	Revoked bool

	CreatedAt time.Time
}
