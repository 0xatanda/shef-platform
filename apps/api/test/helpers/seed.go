package helpers

import (
	"github.com/google/uuid"

	"github.com/0xatanda/shef-platform/internal/models"
	"github.com/0xatanda/shef-platform/pkg/auth"
	"github.com/0xatanda/shef-platform/pkg/database"
)

func SeedAdmin() *models.User {

	hash, _ := auth.HashPassword("Admin@123")

	user := models.User{
		ID:           uuid.New(),
		FirstName:    "Super",
		LastName:     "Admin",
		Email:        "admin@shef.org",
		PasswordHash: hash,
		Role:         models.RoleAdmin,
		IsActive:     true,
	}

	database.DB.Create(&user)

	return &user
}
