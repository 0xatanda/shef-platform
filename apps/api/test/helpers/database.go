package helpers

import (
	"fmt"
	"os"
	"testing"

	"github.com/0xatanda/shef-platform/configs"
	"github.com/0xatanda/shef-platform/pkg/database"
	"gorm.io/gorm"
)

func SetupTestDB(t *testing.T) *gorm.DB {
	os.Setenv("APP_ENV", "test")

	configs.LoadEnv()

	cfg := configs.Load()

	fmt.Printf("CONFIG: %+v\n", *cfg)

	if err := database.Connect(cfg); err != nil {
		t.Fatalf("failed connecting test db: %v", err)
	}

	if err := database.Migrate(cfg); err != nil {
		t.Fatalf("migration failed: %v", err)
	}

	return database.DB
}
