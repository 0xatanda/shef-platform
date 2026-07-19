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
}
