package helpers

import (
	"fmt"
	"os"

	"github.com/0xatanda/shef-platform/configs"
	"github.com/0xatanda/shef-platform/pkg/database"
	"gorm.io/gorm"
)

func SetupTestDB() *gorm.DB {
	os.Setenv("APP_ENV", "test")

	configs.LoadEnv()

	cfg := configs.Load()

	fmt.Printf("CONFIG: %+v\n", *cfg)

	if err := database.Connect(cfg); err != nil {
		panic(fmt.Errorf("failed connecting test db: %w", err))
	}

	if err := database.Migrate(cfg); err != nil {
		panic(fmt.Errorf("migration failed: %w", err))
	}

	return database.DB
}
