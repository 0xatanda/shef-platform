package services

import (
	"context"

	"github.com/google/uuid"

	"github.com/0xatanda/shef-platform/internal/models"
)

type UserRepository interface {
	FindByEmail(ctx context.Context, email string) (*models.User, error)
	FindByID(ctx context.Context, id uuid.UUID) (*models.User, error)
	UpdateLastLogin(ctx context.Context, id uuid.UUID) error
	List(ctx context.Context, page, limit int) ([]models.User, int64, error)
	Create(ctx context.Context, user *models.User) error
	Update(ctx context.Context, user *models.User) error
	Delete(ctx context.Context, id uuid.UUID) error
	ChangeStatus(ctx context.Context, id uuid.UUID, active bool) error
	ExistsByEmail(ctx context.Context, email string) (bool, error)
}

type ProjectRepository interface {
	Create(ctx context.Context, project *models.Project) error
	Update(ctx context.Context, project *models.Project) error
	Delete(ctx context.Context, id uuid.UUID) error

	FindByID(ctx context.Context, id uuid.UUID) (*models.Project, error)
	FindBySlug(ctx context.Context, slug string) (*models.Project, error)

	ExistsBySlug(ctx context.Context, slug string) (bool, error)
	ExistsBySlugExceptID(ctx context.Context, slug string, id uuid.UUID) (bool, error)
	Restore(ctx context.Context, id uuid.UUID) error
	PermanentDelete(ctx context.Context, id uuid.UUID) error
	FindDeletedByID(ctx context.Context, id uuid.UUID) (*models.Project, error)
	ListDeleted(ctx context.Context, page int, limit int, search string) ([]models.Project, int64, error)
	List(ctx context.Context, page, limit int, search, status string) ([]models.Project, int64, error)
}

type MediaRepository interface {
	Create(ctx context.Context, media *models.Media) error
	FindByID(ctx context.Context, id uuid.UUID) (*models.Media, error)
	List(ctx context.Context, page int, limit int) ([]models.Media, int64, error)
	Delete(ctx context.Context, id uuid.UUID) error
}

type PartnerRepository interface {
	Create(ctx context.Context, partner *models.Partner) error
	FindByID(ctx context.Context, id uuid.UUID) (*models.Partner, error)
	FindByName(ctx context.Context, name string) (*models.Partner, error)
	List(ctx context.Context, page int, limit int, includeDeleted bool) ([]models.Partner, int64, error)
	ListPublic(ctx context.Context) ([]models.Partner, error)
	Update(ctx context.Context, partner *models.Partner) error
	Delete(ctx context.Context, id uuid.UUID) error
	Restore(ctx context.Context, id uuid.UUID) error
	PermanentDelete(ctx context.Context, id uuid.UUID) error
	ExistsByName(ctx context.Context, name string) (bool, error)
	ExistsByNameExceptID(ctx context.Context, name string, id uuid.UUID) (bool, error)
}

type ProjectMediaRepository interface {
	Create(ctx context.Context, projectMedia *models.ProjectMedia) error
	ListByProjectID(ctx context.Context, projectID uuid.UUID) ([]models.ProjectMedia, error)
	FindByID(ctx context.Context, id uuid.UUID) (*models.ProjectMedia, error)
	Delete(ctx context.Context, id uuid.UUID) error
	ClearFeatured(ctx context.Context, projectID uuid.UUID) error
	SetFeatured(ctx context.Context, id uuid.UUID) error
	UpdateOrder(ctx context.Context, id uuid.UUID, sortOrder int) error
	Exists(ctx context.Context, projectID uuid.UUID, mediaID uuid.UUID) (bool, error)
}

type ContentMediaRepository interface {
	Create(ctx context.Context, media *models.ContentMedia) error
	FindByID(ctx context.Context, id uuid.UUID) (*models.ContentMedia, error)
	Update(ctx context.Context, media *models.ContentMedia) error
	Delete(ctx context.Context, id uuid.UUID) error
	List(ctx context.Context, page int, limit int, mediaType string) ([]models.ContentMedia, int64, error)
}

type PublicationRepository interface {
	Create(ctx context.Context, publication *models.Publication) error
	FindByID(ctx context.Context, id uuid.UUID) (*models.Publication, error)
	FindBySlug(ctx context.Context, slug string) (*models.Publication, error)
	List(ctx context.Context, page int, limit int) ([]models.Publication, int64, error)
	ListPublished(ctx context.Context, page int, limit int) ([]models.Publication, int64, error)
	Update(ctx context.Context, publication *models.Publication) error
	Delete(ctx context.Context, id uuid.UUID) error
	Restore(ctx context.Context, id uuid.UUID) error
	PermanentDelete(ctx context.Context, id uuid.UUID) error
	FindDeletedByID(ctx context.Context, id uuid.UUID) (*models.Publication, error)
	ExistsBySlug(ctx context.Context, slug string) (bool, error)
	ExistsBySlugExceptID(ctx context.Context, slug string, id uuid.UUID) (bool, error)
	ListDeleted(ctx context.Context, page int, limit int) ([]models.Publication, int64, error)

	CreateWithRelations(ctx context.Context, publication *models.Publication, media []models.PublicationMedia, blocks []models.PublicationBlock) error
	FindPublishedByID(ctx context.Context, id uuid.UUID) (*models.Publication, error)
	UpdateWithRelations(ctx context.Context, publication *models.Publication, media []models.PublicationMedia, blocks []models.PublicationBlock) error
}
