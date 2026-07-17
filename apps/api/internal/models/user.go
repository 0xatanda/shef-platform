package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type User struct {
	ID uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`

	FirstName string `gorm:"size:100;not null"`

	LastName string `gorm:"size:100;not null"`

	Email string `gorm:"size:255;uniqueIndex;not null"`

	PasswordHash string `gorm:"type:text;not null"`

	Avatar string `gorm:"type:text"`

	Role UserRole `gorm:"size:30;default:'admin';not null"`

	IsActive bool `gorm:"default:true"`

	EmailVerified bool `gorm:"default:false"`

	LastLogin *time.Time

	CreatedAt time.Time

	UpdatedAt time.Time

	DeletedAt gorm.DeletedAt `gorm:"index"`
}
