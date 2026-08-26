package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type SiteContent struct {
	ID uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`

	Key string `gorm:"type:varchar(100);uniqueIndex;not null"`

	Title string `gorm:"type:varchar(255)"`

	Content string `gorm:"type:text"`

	CreatedAt time.Time

	UpdatedAt time.Time

	DeletedAt gorm.DeletedAt `gorm:"index"`
}
