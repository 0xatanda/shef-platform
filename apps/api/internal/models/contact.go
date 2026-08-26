package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type ContactStatus string

const (
	ContactUnread ContactStatus = "unread"
	ContactRead   ContactStatus = "read"
)

type Contact struct {
	ID uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`

	Name    string `gorm:"type:varchar(255);not null"`
	Email   string `gorm:"type:varchar(255);not null"`
	Phone   string `gorm:"type:varchar(50)"`
	Subject string `gorm:"type:varchar(255)"`
	Message string `gorm:"type:text;not null"`

	Status ContactStatus `gorm:"type:varchar(20);not null;default:'unread';index"`

	CreatedAt time.Time
	UpdatedAt time.Time
	DeletedAt gorm.DeletedAt `gorm:"index"`
}
