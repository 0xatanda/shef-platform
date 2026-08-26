package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Testimonial struct {
	ID uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`

	Name string `gorm:"type:varchar(255);not null"`

	Role string `gorm:"type:varchar(255)"`

	Organization string `gorm:"type:varchar(255)"`

	Content string `gorm:"type:text;not null"`

	ImageURL string `gorm:"type:text"`

	SortOrder int `gorm:"not null;default:0"`

	IsActive bool `gorm:"not null;default:true"`

	CreatedAt time.Time

	UpdatedAt time.Time

	DeletedAt gorm.DeletedAt `gorm:"index"`
}
