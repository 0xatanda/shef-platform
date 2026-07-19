package repositories

import (
	"context"
	"os"
	"testing"

	"github.com/0xatanda/shef-platform/test/helpers"
	"gorm.io/gorm"
)

var testDB *gorm.DB

func TestMain(m *testing.M) {
	testDB = helpers.SetupTestDB()

	code := m.Run()

	helpers.TruncateTables()

	os.Exit(code)
}

func TestFindByEmail(t *testing.T) {
	helpers.TruncateTables()

	admin := helpers.SeedAdmin()

	repo := NewUserRepository(testDB)

	user, err := repo.FindByEmail(
		context.Background(),
		admin.Email,
	)
	if err != nil {
		t.Fatal(err)
	}

	if user.Email != admin.Email {
		t.Fatal("email mismatch")
	}
}

func TestFindByEmailNotFound(t *testing.T) {
	helpers.TruncateTables()

	repo := NewUserRepository(testDB)

	_, err := repo.FindByEmail(
		context.Background(),
		"missing@shef.org",
	)

	if err == nil {
		t.Fatal("expected error")
	}
}

func TestFindByID(t *testing.T) {
	helpers.TruncateTables()

	admin := helpers.SeedAdmin()

	repo := NewUserRepository(testDB)

	user, err := repo.FindByID(
		context.Background(),
		admin.ID,
	)
	if err != nil {
		t.Fatal(err)
	}

	if user.ID != admin.ID {
		t.Fatal("wrong user")
	}
}

func TestUpdateLastLogin(t *testing.T) {
	helpers.TruncateTables()

	admin := helpers.SeedAdmin()

	repo := NewUserRepository(testDB)

	err := repo.UpdateLastLogin(
		context.Background(),
		admin.ID,
	)
	if err != nil {
		t.Fatal(err)
	}

	user, err := repo.FindByID(
		context.Background(),
		admin.ID,
	)
	if err != nil {
		t.Fatal(err)
	}

	if user.LastLogin == nil {
		t.Fatal("last login not updated")
	}
}
