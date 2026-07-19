package repositories

import (
	"context"
	"errors"
	"time"

	"github.com/0xatanda/shef-platform/internal/models"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type UserRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) *UserRepository {
	return &UserRepository{
		db: db,
	}
}

// Create a new user
func (r *UserRepository) Create(ctx context.Context, user *models.User) error {
	return r.db.WithContext(ctx).Create(user).Error
}

// Find user by ID
func (r *UserRepository) FindByID(ctx context.Context, id uuid.UUID) (*models.User, error) {
	var user models.User

	err := r.db.WithContext(ctx).First(&user, "id = ?", id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, gorm.ErrRecordNotFound
		}
		return nil, err
	}

	return &user, nil
}

// Find user by email
func (r *UserRepository) FindByEmail(ctx context.Context, email string) (*models.User, error) {
	var user models.User

	err := r.db.Where("email = ?", email).First(&user).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, gorm.ErrRecordNotFound
		}
		return nil, err
	}

	return &user, nil
}

// Update user
func (r *UserRepository) Update(ctx context.Context, user *models.User) error {
	return r.db.WithContext(ctx).Save(user).Error
}

// Delete user (soft delete)
func (r *UserRepository) Delete(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).Delete(&models.User{}, "id = ?", id).Error
}

// Update last login
func (r *UserRepository) UpdateLastLogin(ctx context.Context, id uuid.UUID) error {
	now := time.Now()

	return r.db.WithContext(ctx).Model(&models.User{}).
		Where("id = ?", id).
		Update("last_login", now).Error
}

// Verify email
func (r *UserRepository) VerifyEmail(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).Model(&models.User{}).
		Where("id = ?", id).
		Update("email_verified", true).Error
}

// Update password
func (r *UserRepository) UpdatePassword(ctx context.Context, id uuid.UUID, passwordHash string) error {
	return r.db.WithContext(ctx).Model(&models.User{}).
		Where("id = ?", id).
		Update("password_hash", passwordHash).Error
}

// List users with pagination
func (r *UserRepository) List(
	ctx context.Context,
	page,
	limit int,
) ([]models.User, int64, error) {

	var (
		users []models.User
		total int64
	)

	offset := (page - 1) * limit

	if err := r.db.WithContext(ctx).
		Model(&models.User{}).
		Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if err := r.db.WithContext(ctx).
		Limit(limit).
		Offset(offset).
		Order("created_at DESC").
		Find(&users).Error; err != nil {
		return nil, 0, err
	}

	return users, total, nil
}

func (r *UserRepository) ChangeStatus(
	ctx context.Context,
	id uuid.UUID,
	active bool,
) error {
	return r.db.WithContext(ctx).
		Model(&models.User{}).
		Where("id = ?", id).
		Update("is_active", active).
		Error
}
