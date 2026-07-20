package main

import (
	"context"
	"errors"
	"log"

	"github.com/0xatanda/shef-platform/configs"
	"github.com/0xatanda/shef-platform/internal/models"
	"github.com/0xatanda/shef-platform/internal/repositories"
	"github.com/0xatanda/shef-platform/pkg/auth"
	"github.com/0xatanda/shef-platform/pkg/database"
	"gorm.io/gorm"
)

func main() {
	configs.LoadEnv()
	cfg := configs.Load()

	if err := database.Connect(cfg); err != nil {
		log.Fatal(err)
	}

	ctx := context.Background()

	userRepo := repositories.NewUserRepository(database.DB)

	// Check if admin already exists
	_, err := userRepo.FindByEmail(ctx, "admin@shef.org")
	if err == nil {
		log.Println("✅ Admin already exists")
		return
	}

	if !errors.Is(err, gorm.ErrRecordNotFound) {
		log.Fatal(err)
	}

	passwordHash, err := auth.HashPassword("admin123")
	if err != nil {
		log.Fatal(err)
	}

	admin := &models.User{
		FirstName:     "System",
		LastName:      "Administrator",
		Email:         "admin@shef.org",
		PasswordHash:  passwordHash,
		Role:          models.RoleSuperAdmin,
		IsActive:      true,
		EmailVerified: true,
	}

	if err := userRepo.Create(ctx, admin); err != nil {
		log.Fatal(err)
	}

	log.Println("✅ Admin user created successfully")
}
