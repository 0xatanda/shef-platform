package repositories

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/0xatanda/shef-platform/internal/models"
	"github.com/0xatanda/shef-platform/pkg/database"
)

type RefreshTokenRepository struct {
	db *gorm.DB
}

func NewRefreshTokenRepository() *RefreshTokenRepository {
	return &RefreshTokenRepository{
		db: database.DB,
	}
}

// Save a refresh token
func (r *RefreshTokenRepository) Create(
	userID uuid.UUID,
	tokenHash string,
	expiresAt time.Time,
) error {

	token := models.RefreshToken{
		UserID:    userID,
		Token:     tokenHash,
		ExpiresAt: expiresAt,
		Revoked:   false,
	}

	return r.db.Create(&token).Error
}

// Find refresh token
func (r *RefreshTokenRepository) Find(
	tokenHash string,
) (*models.RefreshToken, error) {

	var token models.RefreshToken

	err := r.db.
		Where("token = ?", tokenHash).
		First(&token).Error

	if err != nil {
		return nil, err
	}

	return &token, nil
}

// Revoke refresh token
func (r *RefreshTokenRepository) Revoke(
	tokenHash string,
) error {

	return r.db.
		Model(&models.RefreshToken{}).
		Where("token = ?", tokenHash).
		Update("revoked", true).Error
}
