package models

import (
	"time"

	"github.com/google/uuid"
)

type FocusArea struct {
	ID uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`

	Title string `gorm:"size:255;not null"`

	Slug string `gorm:"size:255;uniqueIndex;not null"`

	Description string `gorm:"type:text;not null;default:''"`

	ImageURL string `gorm:"type:text;not null;default:''"`

	SortOrder int `gorm:"not null;default:0"`

	IsActive bool `gorm:"not null;default:true"`

	CreatedAt time.Time

	UpdatedAt time.Time
}
