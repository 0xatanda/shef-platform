package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Media struct {
	ID uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`

	OriginalName string `gorm:"type:text;not null"`

	Filename string `gorm:"type:text;not null"`

	MimeType string `gorm:"size:255;not null"`

	Size int64 `gorm:"not null"`

	Path string `gorm:"type:text;not null"`

	URL string `gorm:"type:text;not null"`

	UploadedBy uuid.UUID `gorm:"type:uuid"`

	CreatedAt time.Time

	DeletedAt gorm.DeletedAt `gorm:"index"`
}
