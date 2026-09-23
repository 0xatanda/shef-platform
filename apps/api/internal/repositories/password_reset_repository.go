package repositories

import (
	"context"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/0xatanda/shef-platform/internal/models"
)

type PasswordResetRepository struct {
	db *gorm.DB
}

func NewPasswordResetRepository(
	db *gorm.DB,
) *PasswordResetRepository {
	return &PasswordResetRepository{
		db: db,
	}
}

func (r *PasswordResetRepository) Create(
	ctx context.Context,
	token *models.PasswordResetToken,
) error {
	return r.db.WithContext(ctx).
		Create(token).
		Error
}

func (r *PasswordResetRepository) FindByHash(
	ctx context.Context,
	tokenHash string,
) (*models.PasswordResetToken, error) {
	var token models.PasswordResetToken

	err := r.db.WithContext(ctx).
		Where("token_hash = ?", tokenHash).
		First(&token).
		Error

	if err != nil {
		return nil, err
	}

	return &token, nil
}

func (r *PasswordResetRepository) MarkUsed(
	ctx context.Context,
	id uuid.UUID,
) error {
	now := time.Now()

	return r.db.WithContext(ctx).
		Model(&models.PasswordResetToken{}).
		Where(
			"id = ? AND used_at IS NULL",
			id,
		).
		Update(
			"used_at",
			now,
		).
		Error
}

func (r *PasswordResetRepository) RevokeActiveForUser(
	ctx context.Context,
	userID uuid.UUID,
) error {
	now := time.Now()

	return r.db.WithContext(ctx).
		Model(&models.PasswordResetToken{}).
		Where(
			"user_id = ? AND used_at IS NULL AND expires_at > ?",
			userID,
			now,
		).
		Update(
			"used_at",
			now,
		).
		Error
}

func (r *PasswordResetRepository) DeleteExpired(
	ctx context.Context,
	now time.Time,
) error {
	return r.db.WithContext(ctx).
		Where(
			"expires_at <= ?",
			now,
		).
		Delete(
			&models.PasswordResetToken{},
		).
		Error
}
