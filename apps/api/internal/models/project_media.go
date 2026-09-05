package models

import (
	"time"

	"github.com/google/uuid"
)

type ProjectMedia struct {
	ID uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`

	ProjectID uuid.UUID `gorm:"type:uuid;not null;index"`
	MediaID   uuid.UUID `gorm:"type:uuid;not null;index"`

	SortOrder int `gorm:"not null;default:0"`

	IsFeatured bool `gorm:"not null;default:false"`

	CreatedAt time.Time
	UpdatedAt time.Time

	Media ContentMedia `gorm:"foreignKey:MediaID"`
}
