package models

type ProjectStatus string

const (
	ProjectDraft     ProjectStatus = "draft"
	ProjectPublished ProjectStatus = "published"
)
