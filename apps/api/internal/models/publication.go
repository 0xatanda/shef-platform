package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type PublicationStatus string
type PublicationType string
type PublicationSource string

const (
	PublicationReport      PublicationType = "report"
	PublicationArticle     PublicationType = "article"
	PublicationResearch    PublicationType = "research"
	PublicationPolicyBrief PublicationType = "policy_brief"
	PublicationCaseStudy   PublicationType = "case_study"
	PublicationOther       PublicationType = "other"

	PublicationDraft     PublicationStatus = "draft"
	PublicationPublished PublicationStatus = "published"

	PublicationSourceSHEF     PublicationSource = "shef"
	PublicationSourceExternal PublicationSource = "external"
)

type Publication struct {
	ID      uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	Title   string    `gorm:"size:255;not null"`
	Slug    string    `gorm:"size:255;uniqueIndex;not null"`
	Summary string    `gorm:"type:text"`
	Content string    `gorm:"type:text"`

	Type   PublicationType   `gorm:"size:30;not null;default:'article'"`
	Status PublicationStatus `gorm:"size:20;not null;default:'draft'"`

	FeaturedImage string `gorm:"type:text"`
	Author        string `gorm:"size:255"`

	PublicationSource PublicationSource `gorm:"column:publication_source;size:20;not null;default:'shef'"`
	PublisherName     string            `gorm:"column:publisher_name;size:255"`
	ExternalURL       string            `gorm:"column:external_url;type:text"`
	ExternalLinkText  string            `gorm:"column:external_link_text;size:255"`

	Media  []PublicationMedia `gorm:"foreignKey:PublicationID"`
	Blocks []PublicationBlock `gorm:"foreignKey:PublicationID"`

	PublishedAt *time.Time
	PublishedBy *uuid.UUID `gorm:"type:uuid"`

	CreatedBy uuid.UUID `gorm:"type:uuid"`
	UpdatedBy uuid.UUID `gorm:"type:uuid"`

	CreatedAt time.Time
	UpdatedAt time.Time

	DeletedAt gorm.DeletedAt `gorm:"index"`
}
