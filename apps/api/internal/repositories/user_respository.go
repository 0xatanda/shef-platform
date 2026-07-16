package repositories

import (
	"errors"
	"time"

	"github.com/0xatanda/shef-platform/internal/models"
	"github.com/0xatanda/shef-platform/pkg/database"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type UserRepository struct {
	db *gorm.DB
}

func NewUserRepository() *UserRepository {
	return &UserRepository{
		db: database.DB,
	}
}

// Create a new user
func (r *UserRepository) Create(user *models.User) error {
	return r.db.Create(user).Error
}

// Find user by ID
func (r *UserRepository) FindByID(id uuid.UUID) (*models.User, error) {
	var user models.User

	err := r.db.First(&user, "id = ?", id).Error
	if err != nil {
		return nil, err
	}

	return &user, nil
}

// Find user by email
func (r *UserRepository) FindByEmail(email string) (*models.User, error) {
	var user models.User

	err := r.db.Where("email = ?", email).First(&user).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, err
		}

		return nil, err
	}

	return &user, nil
}

// Update user
func (r *UserRepository) Update(user *models.User) error {
	return r.db.Save(user).Error
}

// Delete user (soft delete)
func (r *UserRepository) Delete(id uuid.UUID) error {
	return r.db.Delete(&models.User{}, "id = ?", id).Error
}

// Update last login
func (r *UserRepository) UpdateLastLogin(id uuid.UUID) error {
	now := time.Now()

	return r.db.Model(&models.User{}).
		Where("id = ?", id).
		Update("last_login", now).Error
}

// Activate user
func (r *UserRepository) Activate(id uuid.UUID) error {
	return r.db.Model(&models.User{}).
		Where("id = ?", id).
		Update("is_active", true).Error
}

// Deactivate user
func (r *UserRepository) Deactivate(id uuid.UUID) error {
	return r.db.Model(&models.User{}).
		Where("id = ?", id).
		Update("is_active", false).Error
}

// Verify email
func (r *UserRepository) VerifyEmail(id uuid.UUID) error {
	return r.db.Model(&models.User{}).
		Where("id = ?", id).
		Update("email_verified", true).Error
}

// Update password
func (r *UserRepository) UpdatePassword(id uuid.UUID, passwordHash string) error {
	return r.db.Model(&models.User{}).
		Where("id = ?", id).
		Update("password_hash", passwordHash).Error
}

// List users with pagination
func (r *UserRepository) List(limit, offset int) ([]models.User, error) {
	var users []models.User

	err := r.db.
		Limit(limit).
		Offset(offset).
		Order("created_at DESC").
		Find(&users).Error

	return users, err
}

// Count users
func (r *UserRepository) Count() (int64, error) {
	var count int64

	err := r.db.Model(&models.User{}).Count(&count).Error

	return count, err
}
