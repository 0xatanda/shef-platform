package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type ContentMediaType string

const (
	ContentMediaImage   ContentMediaType = "image"
	ContentMediaYouTube ContentMediaType = "youtube"
)

type ContentMedia struct {
	ID uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`

	Type ContentMediaType `gorm:"size:20;not null"`

	Title       string `gorm:"size:255"`
	Description string `gorm:"type:text"`

	URL          string `gorm:"type:text;not null"`
	ThumbnailURL string `gorm:"type:text"`

	YouTubeVideoID string `gorm:"size:100"`

	AltText string `gorm:"size:255"`

	CreatedBy uuid.UUID `gorm:"type:uuid"`
	UpdatedBy uuid.UUID `gorm:"type:uuid"`

	CreatedAt time.Time
	UpdatedAt time.Time

	DeletedAt gorm.DeletedAt `gorm:"index"`
}
