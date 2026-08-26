package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type TeamMember struct {
	ID uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`

	Name string `gorm:"type:varchar(255);not null"`

	Role string `gorm:"type:varchar(255);not null"`

	Bio string `gorm:"type:text"`

	ImageURL string `gorm:"type:text"`

	Email string `gorm:"type:varchar(255)"`

	LinkedIn string `gorm:"type:text"`

	Twitter string `gorm:"type:text"`

	SortOrder int `gorm:"not null;default:0"`

	IsActive bool `gorm:"not null;default:true"`

	CreatedAt time.Time

	UpdatedAt time.Time

	DeletedAt gorm.DeletedAt `gorm:"index"`
}
