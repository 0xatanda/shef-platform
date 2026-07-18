package repositories

import (
	"context"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/0xatanda/shef-platform/internal/models"
)

type RefreshTokenRepository struct {
	db *gorm.DB
}

func NewRefreshTokenRepository(db *gorm.DB) *RefreshTokenRepository {
	return &RefreshTokenRepository{
		db: db,
	}
}

func (r *RefreshTokenRepository) Create(
	ctx context.Context,
	userID uuid.UUID,
	token string,
	expiresAt time.Time,
) error {

	refresh := models.RefreshToken{
		UserID:    userID,
		Token:     token,
		ExpiresAt: expiresAt,
		Revoked:   false,
	}

	return r.db.WithContext(ctx).
		Create(&refresh).
		Error
}

func (r *RefreshTokenRepository) Find(
	ctx context.Context,
	token string,
) (*models.RefreshToken, error) {

	var refresh models.RefreshToken

	err := r.db.WithContext(ctx).
		Where("token = ?", token).
		First(&refresh).
		Error

	if err != nil {
		return nil, err
	}

	return &refresh, nil
}

func (r *RefreshTokenRepository) Revoke(
	ctx context.Context,
	token string,
) error {

	return r.db.WithContext(ctx).
		Model(&models.RefreshToken{}).
		Where("token = ?", token).
		Update("revoked", true).
		Error
}
