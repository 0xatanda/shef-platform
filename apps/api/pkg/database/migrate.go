package database

import (
	"fmt"
	"os"
	"path/filepath"

	"github.com/0xatanda/shef-platform/configs"

	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
)

func Migrate(cfg *configs.Config) error {

	dsn := fmt.Sprintf(
		"postgres://%s:%s@%s:%s/%s?sslmode=disable",
		cfg.DBUser,
		cfg.DBPassword,
		cfg.DBHost,
		cfg.DBPort,
		cfg.DBName,
	)

	wd, _ := os.Getwd()

	migrationPath := filepath.Join(wd, "migrations")

	if _, err := os.Stat(migrationPath); os.IsNotExist(err) {
		migrationPath = filepath.Join(wd, "../../migrations")
	}

	source := "file://" + migrationPath

	m, err := migrate.New(
		source,
		dsn,
	)
	if err != nil {
		return err
	}

	err = m.Up()

	if err != nil && err != migrate.ErrNoChange {
		return err
	}

	return nil
}
