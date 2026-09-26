package main

import (
	"bufio"
	"context"
	"errors"
	"fmt"
	"log"
	"os"
	"strings"

	"github.com/0xatanda/shef-platform/configs"
	"github.com/0xatanda/shef-platform/internal/models"
	"github.com/0xatanda/shef-platform/internal/repositories"
	"github.com/0xatanda/shef-platform/pkg/auth"
	"github.com/0xatanda/shef-platform/pkg/database"
	"golang.org/x/crypto/bcrypt"
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

	email := "admin@shef.org"

	// Check if admin already exists.
	_, err := userRepo.FindByEmail(ctx, email)

	if err == nil {
		log.Println("Admin account already exists.")
		return
	}

	if !errors.Is(err, gorm.ErrRecordNotFound) {
		log.Fatal(err)
	}

	// ------------------------------------------------------------
	// Read password securely from terminal
	// ------------------------------------------------------------

	reader := bufio.NewReader(os.Stdin)

	fmt.Print("Enter Super Admin password: ")

	password, err := reader.ReadString('\n')
	if err != nil {
		log.Fatal("Unable to read password:", err)
	}

	password = strings.TrimSpace(password)

	if len(password) < 12 {
		log.Fatal("Password must be at least 12 characters.")
	}

	if len(password) > 100 {
		log.Fatal("Password must not exceed 100 characters.")
	}

	// ------------------------------------------------------------
	// Generate bcrypt password hash
	// ------------------------------------------------------------

	passwordHash, err := auth.HashPassword(password)
	if err != nil {
		log.Fatal("Unable to hash password:", err)
	}

	// Verify the generated hash before saving.
	if err := bcrypt.CompareHashAndPassword(
		[]byte(passwordHash),
		[]byte(password),
	); err != nil {
		log.Fatal("Generated password hash could not be verified:", err)
	}

	// ------------------------------------------------------------
	// Create Super Admin
	// ------------------------------------------------------------

	admin := &models.User{
		FirstName:     "System",
		LastName:      "Administrator",
		Email:         email,
		PasswordHash:  passwordHash,
		Role:          models.RoleSuperAdmin,
		IsActive:      true,
		EmailVerified: true,
	}

	if err := userRepo.Create(ctx, admin); err != nil {
		log.Fatal("Unable to create Super Admin:", err)
	}

	log.Println("Super Admin created successfully.")
	log.Println("Email:", admin.Email)
	log.Println("Role:", admin.Role)
	log.Println("Active:", admin.IsActive)
}
