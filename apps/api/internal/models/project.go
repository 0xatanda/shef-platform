package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Project struct {
	ID uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`

	Title string `gorm:"size:255;not null"`

	Slug string `gorm:"size:255;uniqueIndex;not null"`

	Summary string `gorm:"type:text"`

	Content string `gorm:"type:text;not null"`

	FeaturedImage string `gorm:"type:text"`

	Status ProjectStatus `gorm:"size:20;default:'draft'"`

	Media []ProjectMedia `gorm:"foreignKey:ProjectID"`

	PublishedAt *time.Time

	CreatedBy uuid.UUID `gorm:"type:uuid"`

	UpdatedBy uuid.UUID `gorm:"type:uuid"`

	PublishedBy *uuid.UUID `gorm:"type:uuid"`

	CreatedAt time.Time

	UpdatedAt time.Time

	DeletedAt gorm.DeletedAt `gorm:"index"`
}
