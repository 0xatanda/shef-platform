package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Partner struct {
	ID uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`

	Name string `gorm:"size:255;not null;uniqueIndex"`

	Logo string `gorm:"type:text;not null"`

	Website string `gorm:"type:text"`

	Description string `gorm:"type:text"`

	DisplayOrder int `gorm:"not null;default:0;index"`

	IsActive bool `gorm:"not null;default:true;index"`

	CreatedAt time.Time

	UpdatedAt time.Time

	DeletedAt gorm.DeletedAt `gorm:"index"`
}
