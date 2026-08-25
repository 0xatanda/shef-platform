package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type PublicationStatus string

type PublicationType string

const (
	PublicationReport      PublicationType   = "report"
	PublicationArticle     PublicationType   = "article"
	PublicationResearch    PublicationType   = "research"
	PublicationPolicyBrief PublicationType   = "policy_brief"
	PublicationCaseStudy   PublicationType   = "case_study"
	PublicationOther       PublicationType   = "other"
	PublicationDaft        PublicationStatus = "daft"
	PublicationPublished   PublicationStatus = "published"
)

type Publication struct {
	ID uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`

	Title string `gorm:"size:255;not null"`

	Slug string `gorm:"size:255;uniqueIndex;not null"`

	Summary string `gorm:"type:text"`

	Content string `gorm:"type:text;not null"`

	Type PublicationType `gorm:"size:30;not null;default:'article'"`

	Status PublicationStatus `gorm:"size:20;not null;default:'draft'"`

	FeaturedImage string `gorm:"type:text"`

	Author string `gorm:"size:255"`

	PublishedAt *time.Time

	PublishedBy *uuid.UUID `gorm:"type:uuid"`

	CreatedBy uuid.UUID `gorm:"type:uuid"`

	UpdatedBy uuid.UUID `gorm:"type:uuid"`

	CreatedAt time.Time

	UpdatedAt time.Time

	DeletedAt gorm.DeletedAt `gorm:"index"`
}
