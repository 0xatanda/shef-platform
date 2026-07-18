package helpers

import "github.com/0xatanda/shef-platform/pkg/database"

func TruncateTables() {

	database.DB.Exec(`
		TRUNCATE TABLE
			refresh_tokens,
			users
		RESTART IDENTITY CASCADE;
	`)
}
