package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type DonationStatus string

const (
	DonationPending   DonationStatus = "pending"
	DonationContacted DonationStatus = "contacted"
	DonationCompleted DonationStatus = "completed"
	DonationCancelled DonationStatus = "cancelled"
)

type Donation struct {
	ID uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`

	Name string `gorm:"type:varchar(255);not null"`

	Email string `gorm:"type:varchar(255);not null"`

	Phone string `gorm:"type:varchar(50)"`

	Amount float64 `gorm:"type:numeric(15,2);not null;default:0"`

	Currency string `gorm:"type:varchar(10);not null;default:'NGN'"`

	Message string `gorm:"type:text"`

	Status DonationStatus `gorm:"type:varchar(30);not null;default:'pending'"`

	AdminNote string `gorm:"type:text"`

	CreatedAt time.Time

	UpdatedAt time.Time

	DeletedAt gorm.DeletedAt `gorm:"index"`
}
