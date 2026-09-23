package repositories

import (
	"context"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/0xatanda/shef-platform/internal/models"
)

type UserSessionRepository struct {
	db *gorm.DB
}

func NewUserSessionRepository(
	db *gorm.DB,
) *UserSessionRepository {

	return &UserSessionRepository{
		db: db,
	}
}

func (r *UserSessionRepository) Create(
	ctx context.Context,
	session *models.UserSession,
) error {

	return r.db.WithContext(ctx).
		Create(session).
		Error
}

func (r *UserSessionRepository) FindByID(
	ctx context.Context,
	id uuid.UUID,
) (*models.UserSession, error) {

	var session models.UserSession

	err := r.db.WithContext(ctx).
		Where("id = ?", id).
		First(&session).
		Error

	if err != nil {
		return nil, err
	}

	return &session, nil
}

func (r *UserSessionRepository) FindByRefreshTokenHash(
	ctx context.Context,
	hash string,
) (*models.UserSession, error) {

	var session models.UserSession

	err := r.db.WithContext(ctx).
		Where(
			"refresh_token_hash = ?",
			hash,
		).
		First(&session).
		Error

	if err != nil {
		return nil, err
	}

	return &session, nil
}

func (r *UserSessionRepository) UpdateLastSeen(
	ctx context.Context,
	id uuid.UUID,
	lastSeen time.Time,
) error {

	return r.db.WithContext(ctx).
		Model(&models.UserSession{}).
		Where("id = ?", id).
		Update(
			"last_seen_at",
			lastSeen,
		).
		Error
}

func (r *UserSessionRepository) Revoke(
	ctx context.Context,
	id uuid.UUID,
) error {

	now := time.Now()

	return r.db.WithContext(ctx).
		Model(&models.UserSession{}).
		Where("id = ?", id).
		Updates(map[string]interface{}{
			"revoked_at": now,
		}).
		Error
}

func (r *UserSessionRepository) RevokeByUserID(
	ctx context.Context,
	userID uuid.UUID,
) error {

	now := time.Now()

	return r.db.WithContext(ctx).
		Model(&models.UserSession{}).
		Where(
			"user_id = ? AND revoked_at IS NULL",
			userID,
		).
		Update(
			"revoked_at",
			now,
		).
		Error
}

func (r *UserSessionRepository) RevokeExpired(
	ctx context.Context,
	now time.Time,
) error {

	return r.db.WithContext(ctx).
		Model(&models.UserSession{}).
		Where(
			"expires_at <= ? AND revoked_at IS NULL",
			now,
		).
		Update(
			"revoked_at",
			now,
		).
		Error
}

func (r *UserSessionRepository) RevokeInactive(
	ctx context.Context,
	now time.Time,
	idleTimeout time.Duration,
) error {

	cutoff := now.Add(-idleTimeout)

	return r.db.WithContext(ctx).
		Model(&models.UserSession{}).
		Where(
			"last_seen_at <= ? AND revoked_at IS NULL",
			cutoff,
		).
		Update(
			"revoked_at",
			now,
		).
		Error
}
