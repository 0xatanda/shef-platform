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

	if err := database.Connect(cfg); err != nil {
		fmt.Println("Unable to connect to database.")
		fmt.Println("Database error:", err)
		os.Exit(1)
	}

	ctx := context.Background()

	userRepo := repositories.NewUserRepository(
		database.DB,
	)

	reader := bufio.NewReader(
		os.Stdin,
	)

	// ============================================================
	// Read current admin email
	// ============================================================

	fmt.Print("Enter current admin email: ")

	currentEmail, err := reader.ReadString('\n')

	if err != nil {
		fmt.Println("Unable to read current admin email.")
		os.Exit(1)
	}

	currentEmail = normalizeEmail(currentEmail)

	if currentEmail == "" {
		fmt.Println("Admin email cannot be empty.")
		os.Exit(1)
	}

	// ============================================================
	// Find admin account
	// ============================================================

	user, err := userRepo.FindByEmail(
		ctx,
		currentEmail,
	)

	if err != nil {
		fmt.Println("Admin account not found.")
		os.Exit(1)
	}

	fmt.Println()
	fmt.Println("Admin account found.")
	fmt.Println("ID:", user.ID)
	fmt.Println("Current email:", user.Email)
	fmt.Println("Active:", user.IsActive)
	fmt.Println("Role:", user.Role)

	// ============================================================
	// Validate admin account
	// ============================================================

	if !user.IsActive {
		fmt.Println("This admin account is inactive.")
		os.Exit(1)
	}

	// Both admin and super_admin accounts are allowed to use
	// this command.
	if user.Role != "admin" && user.Role != "super_admin" {
		fmt.Println("The selected account does not have an administrative role.")
		os.Exit(1)
	}

	// ============================================================
	// Read new admin email
	// ============================================================

	fmt.Println()
	fmt.Print("Enter new admin email: ")

	newEmail, err := reader.ReadString('\n')

	if err != nil {
		fmt.Println("Unable to read new admin email.")
		os.Exit(1)
	}

	newEmail = normalizeEmail(newEmail)

	if newEmail == "" {
		fmt.Println("New admin email cannot be empty.")
		os.Exit(1)
	}

	// ============================================================
	// Check whether the email is already in use
	// ============================================================

	emailChanged := newEmail != normalizeEmail(user.Email)

	if emailChanged {
		exists, err := userRepo.ExistsByEmail(
			ctx,
			newEmail,
		)

		if err != nil {
			fmt.Println(
				"Unable to check whether the new email already exists.",
			)
			fmt.Println("Database error:", err)
			os.Exit(1)
		}

		if exists {
			fmt.Println(
				"The new email is already associated with another account.",
			)
			os.Exit(1)
		}
	}

	// ============================================================
	// Read new password
	// ============================================================

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
	// Update email if changed
	// ============================================================

	if emailChanged {
		if err := userRepo.UpdateEmail(
			ctx,
			user.ID,
			newEmail,
		); err != nil {
			fmt.Println(
				"Unable to update admin email.",
			)
			fmt.Println("Database error:", err)
			os.Exit(1)
		}

		fmt.Println(
			"Admin email updated successfully.",
		)
	}

	// ============================================================
	// Update password
	// ============================================================

	if err := userRepo.UpdatePassword(
		ctx,
		user.ID,
		string(hash),
	); err != nil {
		fmt.Println(
			"Unable to update admin password.",
		)
		fmt.Println("Database error:", err)

		if emailChanged {
			fmt.Println(
				"WARNING: the admin email was changed, but the password update failed.",
			)
		}

		os.Exit(1)
	}

	fmt.Println(
		"Admin password updated successfully.",
	)

	// ============================================================
	// Reload user from database
	// ============================================================

	updatedUser, err := userRepo.FindByEmail(
		ctx,
		newEmail,
	)

	if err != nil {
		fmt.Println(
			"Credentials were updated, but the user could not be reloaded.",
		)
		fmt.Println("Database error:", err)
		os.Exit(1)
	}

	// ============================================================
	// Verify stored email
	// ============================================================

	if normalizeEmail(updatedUser.Email) != newEmail {
		fmt.Println(
			"ERROR: the email stored in the database does not match the new email.",
		)
		os.Exit(1)
	}

	// ============================================================
	// Verify stored password hash
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

	fmt.Println()
	fmt.Println("========================================")
	fmt.Println("Admin credentials updated successfully.")
	fmt.Println("========================================")
	fmt.Println("Login email:", updatedUser.Email)
	fmt.Println("Account active:", updatedUser.IsActive)
	fmt.Println("Role:", updatedUser.Role)
	fmt.Println()
	fmt.Println("The new password was NOT stored in this command output.")
}

// normalizeEmail ensures admin email values are stored and
// compared consistently.
func normalizeEmail(email string) string {
	return strings.TrimSpace(
		strings.ToLower(email),
	)
}
