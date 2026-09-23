package main

import (
	"bufio"
	"context"
	"fmt"
	"os"
	"strings"

	"golang.org/x/crypto/bcrypt"

	"github.com/0xatanda/shef-platform/configs"
	"github.com/0xatanda/shef-platform/internal/repositories"
	"github.com/0xatanda/shef-platform/pkg/database"
)

func main() {
	// ============================================================
	// Load environment
	// ============================================================

	configs.LoadEnv()

	cfg := configs.Load()

	// ============================================================
	// Connect to database
	// ============================================================

	database.Connect(cfg)

	ctx := context.Background()

	userRepo := repositories.NewUserRepository(
		database.DB,
	)

	// ============================================================
	// Find admin account
	// ============================================================

	email := "admin@shef.org"

	user, err := userRepo.FindByEmail(
		ctx,
		email,
	)

	if err != nil {
		fmt.Println("Admin account not found.")
		os.Exit(1)
	}

	fmt.Println("Admin account found.")
	fmt.Println("ID:", user.ID)
	fmt.Println("Email:", user.Email)
	fmt.Println("Active:", user.IsActive)
	fmt.Println("Role:", user.Role)

	// ============================================================
	// Read password
	// ============================================================

	reader := bufio.NewReader(
		os.Stdin,
	)

	fmt.Print("Enter new admin password: ")

	password, err := reader.ReadString('\n')

	if err != nil {
		fmt.Println("Unable to read password.")
		os.Exit(1)
	}

	password = strings.TrimSpace(password)

	// ============================================================
	// Validate password
	// ============================================================

	if len(password) < 12 {
		fmt.Println(
			"Password must be at least 12 characters.",
		)
		os.Exit(1)
	}

	if len(password) > 100 {
		fmt.Println(
			"Password must not exceed 100 characters.",
		)
		os.Exit(1)
	}

	// ============================================================
	// Generate bcrypt hash
	// ============================================================

	hash, err := bcrypt.GenerateFromPassword(
		[]byte(password),
		bcrypt.DefaultCost,
	)

	if err != nil {
		fmt.Println(
			"Unable to hash password.",
		)
		os.Exit(1)
	}

	// ============================================================
	// Verify generated hash BEFORE saving
	// ============================================================

	if err := bcrypt.CompareHashAndPassword(
		hash,
		[]byte(password),
	); err != nil {
		fmt.Println(
			"ERROR: generated bcrypt hash could not be verified.",
		)
		fmt.Println("bcrypt error:", err)
		os.Exit(1)
	}

	fmt.Println(
		"Generated password hash verified successfully.",
	)

	// ============================================================
	// Save password hash
	// ============================================================

	if err := userRepo.UpdatePassword(
		ctx,
		user.ID,
		string(hash),
	); err != nil {
		fmt.Println(
			"Unable to update password.",
		)
		fmt.Println("Database error:", err)
		os.Exit(1)
	}

	fmt.Println(
		"Password hash written to database.",
	)

	// ============================================================
	// Reload user from database
	// ============================================================

	updatedUser, err := userRepo.FindByEmail(
		ctx,
		email,
	)

	if err != nil {
		fmt.Println(
			"Password was updated, but the user could not be reloaded.",
		)
		fmt.Println("Database error:", err)
		os.Exit(1)
	}

	// ============================================================
	// Verify the hash actually stored in PostgreSQL
	// ============================================================

	if err := bcrypt.CompareHashAndPassword(
		[]byte(updatedUser.PasswordHash),
		[]byte(password),
	); err != nil {
		fmt.Println(
			"ERROR: password hash stored in the database does NOT match the new password.",
		)
		fmt.Println("bcrypt error:", err)
		os.Exit(1)
	}

	fmt.Println(
		"Database password hash verified successfully.",
	)

	// ============================================================
	// Final confirmation
	// ============================================================

	fmt.Println(
		"Admin password updated successfully.",
	)
}
