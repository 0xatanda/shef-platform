package main

import (
	"context"
	"fmt"
	"os"

	"golang.org/x/crypto/bcrypt"

	"github.com/0xatanda/shef-platform/configs"
	"github.com/0xatanda/shef-platform/internal/repositories"
	"github.com/0xatanda/shef-platform/pkg/database"
)

func main() {
	configs.LoadEnv()

	cfg := configs.Load()

	database.Connect(cfg)

	ctx := context.Background()

	userRepo := repositories.NewUserRepository(
		database.DB,
	)

	user, err := userRepo.FindByEmail(
		ctx,
		"admin@shef.org",
	)

	if err != nil {
		fmt.Println("ERROR finding admin:", err)
		os.Exit(1)
	}

	fmt.Println("Admin found")
	fmt.Println("ID:", user.ID)
	fmt.Println("Email:", user.Email)
	fmt.Println("Active:", user.IsActive)
	fmt.Println("Role:", user.Role)
	fmt.Println("Hash exists:", user.PasswordHash != "")
	fmt.Println("Hash length:", len(user.PasswordHash))

	password := os.Getenv("CHECK_ADMIN_PASSWORD")

	if password == "" {
		fmt.Println("Set CHECK_ADMIN_PASSWORD first.")
		os.Exit(1)
	}

	err = bcrypt.CompareHashAndPassword(
		[]byte(user.PasswordHash),
		[]byte(password),
	)

	if err != nil {
		fmt.Println("PASSWORD CHECK: FAILED")
		fmt.Println("bcrypt error:", err)
		os.Exit(1)
	}

	fmt.Println("PASSWORD CHECK: SUCCESS")
}
