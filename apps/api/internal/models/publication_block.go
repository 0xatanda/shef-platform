package models

import (
	"time"

	"github.com/google/uuid"
)

type PublicationBlockType string

const (
	PublicationBlockText  PublicationBlockType = "text"
	PublicationBlockImage PublicationBlockType = "image"
)

type PublicationBlock struct {
	ID uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`

	PublicationID uuid.UUID `gorm:"type:uuid;not null;index"`

	Type PublicationBlockType `gorm:"size:20;not null"`

	Content string `gorm:"type:text"`

	MediaID *uuid.UUID `gorm:"type:uuid"`

	SortOrder int `gorm:"not null;default:0"`

	CreatedAt time.Time
	UpdatedAt time.Time

	Media *ContentMedia `gorm:"foreignKey:MediaID"`
}
